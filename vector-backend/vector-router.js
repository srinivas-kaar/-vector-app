const express = require('express');
const router = express.Router();
const hana = require('@sap/hana-client');

// Get HANA configuration from environment variables (Cloud Foundry)
const getHanaConfig = () => {
    if (process.env.VCAP_SERVICES) {
        try {
            const vcapServices = JSON.parse(process.env.VCAP_SERVICES);
            const hanaService = vcapServices.hana?.[0]?.credentials;

            if (hanaService) {
                return {
                    host: hanaService.host,
                    port: hanaService.port,
                    uid: hanaService.user,
                    pwd: hanaService.password,
                    encrypt: true,
                    sslValidateCertificate: false,
                    connectTimeout: 30000
                };
            }
        } catch (error) {
            console.error('Error parsing VCAP_SERVICES:', error);
        }
    }

    return {
        host: process.env.HANA_HOST || '08a04a8c-1b48-4238-b1b3-d3a456c2a30e.hana.prod-us10.hanacloud.ondemand.com',
        port: process.env.HANA_PORT || '443',
        uid: process.env.HANA_UID || 'BTP_INTERFACE#BTP',
        pwd: process.env.HANA_PWD || 'LrlL(?/2zk]]87/U&SJ&]k/:]]D]8~Wz',
        encrypt: true,
        sslValidateCertificate: false,
        connectTimeout: 30000
    };
};


const withConnection = (req, res, next) => {
    try {
        const hanaConfig = getHanaConfig();
        req.hanaConn = hana.createConnection();

        req.hanaConn.connect(hanaConfig, (err) => {
            if (err) {
                console.error('HANA connection error:', err);
                return res.status(500).json({
                    error: 'Database connection failed',
                    details: err.message,
                    timestamp: new Date().toISOString()
                });
            }
            console.log('Successfully connected to SAP HANA');
            next();
        });
    } catch (error) {
        console.error('Error creating HANA connection:', error);
        return res.status(500).json({
            error: 'Failed to create database connection',
            details: error.message
        });
    }
};

// Cleanup middleware with error handling
const cleanupConnection = (req, res, next) => {
    try {
        if (req.hanaConn) {
            req.hanaConn.disconnect();
            console.log('HANA connection closed');
        }
    } catch (error) {
        console.error('Error closing HANA connection:', error);
    }
    next();
};

// Helpers
const toBit = (v) => (v === true || v === 1 || v === '1' ? 1 : 0);

// Test endpoint
router.get('/test', (req, res) => {
    console.log('Test endpoint called from:', req.headers.origin);
    res.json({
        message: 'Vector API is working!',
        timestamp: new Date().toISOString(),
        origin: req.headers.origin,
        method: req.method,
        environment: process.env.NODE_ENV || 'development'
    });
});

// Get all opportunities
router.get('/opportunities', withConnection, (req, res) => {
    console.log('Opportunities endpoint called from:', req.headers.origin);

    const sql = `SELECT * FROM "BTP_INTERFACE#BTP"."OPPORTUNITY_TRACKING"`;

    req.hanaConn.exec(sql, [], (err, result) => {
        if (err) {
            console.error('HANA query error:', err);
            return res.status(500).json({
                error: 'Failed to fetch opportunities from SAP Datasphere',
                details: err.message,
                timestamp: new Date().toISOString()
            });
        }

        console.log(`Successfully fetched ${result ? result.length : 0} opportunities`);
        res.json(result || []);
    });
}, cleanupConnection);


router.post('/opportunities', withConnection, (req, res) => {
    console.log('Create opportunity endpoint called with data:', req.body);
    const opportunityData = req.body;

    try {
        // Validate required composite key fields
        const customerName = opportunityData.CUSTOMER_NAME || opportunityData.customer_Name || opportunityData.customerName;
        const materialId = opportunityData.MATERIAL_ID || opportunityData.material_ID || opportunityData.materialId;
        const likelyStartDate = opportunityData.LIKELY_START_DATE || opportunityData.likely_Start_Date || opportunityData.createdAt;

        if (!customerName || !materialId || !likelyStartDate) {
            return res.status(400).json({
                error: 'Missing required composite key fields',
                details: {
                    customerName: customerName ? 'OK' : 'MISSING',
                    materialId: materialId ? 'OK' : 'MISSING',
                    likelyStartDate: likelyStartDate ? 'OK' : 'MISSING'
                }
            });
        }

        // First, get the max opportunity ID from the database
        const getMaxIdSql = `
            SELECT MAX(CAST(OPPORTUNITY_ID AS INTEGER)) as maxId
            FROM "BTP_INTERFACE#BTP"."OPPORTUNITY_TRACKING"
        `;

        req.hanaConn.exec(getMaxIdSql, [], (err, result) => {
            if (err) {
                console.error('Error getting max ID:', err);
                return res.status(500).json({
                    error: 'Failed to generate opportunity ID',
                    details: err.message
                });
            }

            // Calculate next ID
            let nextId = 1; // Default if no existing opportunities
            if (result && result.length > 0 && (result[0].MAXID || result[0].maxId)) {
                nextId = (result[0].MAXID || result[0].maxId) + 1;
            }

            console.log(`Generated opportunity ID: ${nextId}`);
            console.log('Required fields:', { customerName, materialId, likelyStartDate });

            // INSERT with composite key fields first
            const sql = `
                INSERT INTO "BTP_INTERFACE#BTP"."OPPORTUNITY_TRACKING" (
                    OPPORTUNITY_ID, CUSTOMER_NAME, MATERIAL_ID, LIKELY_START_DATE,
                    PRODUCT, SALES_LEAD, SALES_TEAM, SALES_STAGE, OPPORTUNITY_TYPE, 
                    ESTIMATED_VOLUME, PIPELINE_PROJECTED_REVENUE, END_DATE, CREATED_AT, CLOSE_DATE
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                nextId,
                customerName,
                materialId,
                likelyStartDate,
                opportunityData.PRODUCT || opportunityData.product,
                opportunityData.SALES_LEAD || opportunityData.sales_Lead || opportunityData.doleSalesLead,
                opportunityData.SALES_TEAM || opportunityData.sales_Team || opportunityData.salesTeam,
                opportunityData.SALES_STAGE || opportunityData.sales_Stage || opportunityData.status,
                opportunityData.OPPORTUNITY_TYPE || opportunityData.opportunity_Type || opportunityData.opportunityType,
                opportunityData.ESTIMATED_VOLUME || opportunityData.estimated_Volume || opportunityData.estimatedVolume,
                opportunityData.PIPELINE_PROJECTED_REVENUE || opportunityData.pipeline_Projected_Revenue || opportunityData.amount,
                opportunityData.END_DATE || opportunityData.end_Date || opportunityData.closeDate,
                new Date().toISOString(),
                opportunityData.END_DATE || opportunityData.end_Date || opportunityData.closeDate
            ];

            req.hanaConn.exec(sql, params, (err2) => {
                if (err2) {
                    console.error('HANA insert error:', err2);
                    return res.status(500).json({
                        error: 'Failed to create opportunity in SAP Datasphere',
                        details: err2.message
                    });
                }

                console.log(`Successfully created opportunity ${nextId} in SAP Datasphere`);

                const createdOpp = {
                    id: nextId,
                    OPPORTUNITY_ID: nextId,
                    CUSTOMER_NAME: customerName,
                    MATERIAL_ID: materialId,
                    LIKELY_START_DATE: likelyStartDate,
                    PRODUCT: opportunityData.PRODUCT || opportunityData.product,
                    SALES_LEAD: opportunityData.SALES_LEAD || opportunityData.sales_Lead || opportunityData.doleSalesLead,
                    SALES_TEAM: opportunityData.SALES_TEAM || opportunityData.sales_Team || opportunityData.salesTeam,
                    SALES_STAGE: opportunityData.SALES_STAGE || opportunityData.sales_Stage || opportunityData.status,
                    OPPORTUNITY_TYPE: opportunityData.OPPORTUNITY_TYPE || opportunityData.opportunity_Type || opportunityData.opportunityType,
                    ESTIMATED_VOLUME: opportunityData.ESTIMATED_VOLUME || opportunityData.estimated_Volume || opportunityData.estimatedVolume,
                    PIPELINE_PROJECTED_REVENUE: opportunityData.PIPELINE_PROJECTED_REVENUE || opportunityData.pipeline_Projected_Revenue || opportunityData.amount,
                    END_DATE: opportunityData.END_DATE || opportunityData.end_Date || opportunityData.closeDate,
                    CREATED_AT: new Date().toISOString(),
                    CLOSE_DATE: opportunityData.END_DATE || opportunityData.end_Date || opportunityData.closeDate
                };

                res.status(201).json(createdOpp);
            });
        });

    } catch (error) {
        console.error('Error processing opportunity creation:', error);
        return res.status(500).json({
            error: 'Failed to process opportunity data',
            details: error.message
        });
    }
}, cleanupConnection);


router.delete('/opportunities/:id', withConnection, (req, res) => {
    console.log('Delete opportunity endpoint called for ID:', req.params.id);

    const sql = `DELETE FROM "BTP_INTERFACE#BTP"."OPPORTUNITY_TRACKING" WHERE OPPORTUNITY_ID = ?`;

    req.hanaConn.exec(sql, [req.params.id], (err) => {
        if (err) {
            console.error('HANA delete error:', err);
            return res.status(500).json({
                error: 'Failed to delete opportunity from SAP Datasphere',
                details: err.message
            });
        }

        console.log('Successfully deleted opportunity from SAP Datasphere');
        res.json({
            message: 'Opportunity deleted successfully from SAP Datasphere',
            id: req.params.id
        });
    });
}, cleanupConnection);

// Bulk delete
router.post('/opportunities/bulk-delete', withConnection, (req, res) => {
    console.log('Bulk delete opportunities endpoint called');
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Invalid or empty IDs array' });
    }

    try {
        const placeholders = ids.map(() => '?').join(',');
        const sql = `DELETE FROM "BTP_INTERFACE#BTP"."OPPORTUNITY_TRACKING" WHERE OPPORTUNITY_ID IN (${placeholders})`;

        req.hanaConn.exec(sql, ids, (err) => {
            if (err) {
                console.error('HANA bulk delete error:', err);
                return res.status(500).json({
                    error: 'Failed to delete opportunities from SAP Datasphere',
                    details: err.message
                });
            }

            console.log(`Successfully deleted ${ids.length} opportunities from SAP Datasphere`);
            res.json({
                message: `${ids.length} opportunities deleted successfully from SAP Datasphere`
            });
        });
    } catch (error) {
        console.error('Error processing bulk delete:', error);
        return res.status(500).json({
            error: 'Failed to process bulk delete request',
            details: error.message
        });
    }
}, cleanupConnection);

router.get('/opportunities/search', withConnection, (req, res) => {
  const { opportunityId, customerName, product, materialId } = req.query || {};

  const where = [];
  const params = [];

  // Exact ID match (numeric compare if possible)
  if (opportunityId && String(opportunityId).trim() !== '') {
    const idTrim = String(opportunityId).trim();
    const asInt = Number.parseInt(idTrim, 10);
    if (!Number.isNaN(asInt)) { where.push('"OPPORTUNITY_ID" = ?'); params.push(asInt); }
    else { where.push('CAST("OPPORTUNITY_ID" AS VARCHAR) = ?'); params.push(idTrim); }
  }

  if (customerName && String(customerName).trim() !== '') {
    where.push('LOWER("CUSTOMER_NAME") LIKE LOWER(?)');
    params.push(`%${String(customerName).trim()}%`);
  }

  if (product && String(product).trim() !== '') {
    where.push('(LOWER("PRODUCT") LIKE LOWER(?) OR LOWER("MATERIAL_ID") LIKE LOWER(?))');
    const like = `%${String(product).trim()}%`;
    params.push(like, like);
  }

  if (materialId && String(materialId).trim() !== '') {
    where.push('LOWER("MATERIAL_ID") = LOWER(?)');
    params.push(String(materialId).trim());
  }

  if (where.length === 0) {
    return res.status(400).json({ error: 'At least one filter is required' });
  }

  let sql = `SELECT * FROM "BTP_INTERFACE#BTP"."OPPORTUNITY_TRACKING" WHERE ${where.join(' AND ')} ORDER BY "CREATED_AT" DESC`;
  req.hanaConn.exec(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to search opportunities', details: err.message });
    res.json(rows || []);
  });
}, cleanupConnection);

router.get('/materials', withConnection, (req, res) => {
    console.log('Fetching materials from SAP Datasphere');

    try {
        const sql = `
            SELECT 
                "Material"                    AS "MATERIAL_ID",
                "Material Description_Final"  AS "PRODUCT",
                "NA Category"                 AS "PRODUCT_CATEGORY",
                "Base Unit"                   AS "BASE_UOM",
                "Net weight LBS"              AS "MATERIAL_WEIGHT",
                "Projection Price"            AS "MATERIAL_PROJECTED_PRICE"
            FROM "BTP_INTERFACE#BTP"."Material"
            ORDER BY "Material Description_Final"
        `;

        req.hanaConn.exec(sql, [], (err, result) => {
            if (err) {
                console.error('HANA query error:', err);
                return res.status(500).json({
                    error: 'Failed to fetch materials from SAP Datasphere',
                    details: err.message
                });
            }

            console.log('Successfully fetched materials from SAP Datasphere');
            res.json(result || []);
        });
    } catch (error) {
        console.error('Error processing materials request:', error);
        return res.status(500).json({
            error: 'Failed to process materials request',
            details: error.message
        });
    }
}, cleanupConnection);

router.get('/users', withConnection, (req, res) => {
    console.log('Fetching user registrations from SAP Datasphere');

    const sql = `
        SELECT
            "FIRST_NAME"     AS "firstName",
            "LAST_NAME"      AS "lastName",
            "PREFERRED_NAME" AS "preferredName",
            "EMAIL"          AS "email",
            "RSM"            AS "isRsm",
            "ALL_FLAG"       AS "isAll",
            "ADMIN_FLAG"     AS "isAdmin"
        FROM "BTP_INTERFACE#BTP"."USER_ACCOUNTS"
        ORDER BY "LAST_NAME","FIRST_NAME"
    `;

    req.hanaConn.exec(sql, [], (err, result) => {
        if (err) {
            console.error('HANA query error (users):', err);
            return res.status(500).json({
                error: 'Failed to fetch users from SAP Datasphere',
                details: err.message,
                timestamp: new Date().toISOString()
            });
        }
        console.log(`Fetched ${result ? result.length : 0} users`);
        res.json(result || []);
    });
}, cleanupConnection);

// Check if user exists (by email)
router.get('/users/exists', withConnection, (req, res) => {
    const email = (req.query.email || '').trim();
    if (!email) return res.status(400).json({ error: 'email is required' });
    const sql = `SELECT 1 AS ONE FROM "BTP_INTERFACE#BTP"."USER_ACCOUNTS" WHERE LOWER("EMAIL") = LOWER(?) LIMIT 1`;
    req.hanaConn.exec(sql, [email], (err, result) => {
        if (err) {
            console.error('HANA users/exists error:', err);
            return res.status(500).json({ error: 'Failed to check user', details: err.message });
        }
        res.json({ exists: Array.isArray(result) && result.length > 0 });
    });
}, cleanupConnection);


router.get('/users/by-email', withConnection, (req, res) => {
    const email = (req.query.email || '').trim();
    if (!email) return res.status(400).json({ error: 'email is required' });

    const sql = `
        SELECT
            "FIRST_NAME"     AS "firstName",
            "LAST_NAME"      AS "lastName",
            "PREFERRED_NAME" AS "preferredName",
            "EMAIL"          AS "email",
            "RSM"            AS "isRsm",
            "ALL_FLAG"       AS "isAll",
            "ADMIN_FLAG"     AS "isAdmin"
        FROM "BTP_INTERFACE#BTP"."USER_ACCOUNTS"
        WHERE LOWER("EMAIL") = LOWER(?)
        LIMIT 1
    `;
    req.hanaConn.exec(sql, [email], (err, rows) => {
        if (err) return res.status(500).json({ error: 'db_error', details: err.message });
        if (!rows || rows.length === 0) return res.status(200).json({ user: null });

        const r = rows[0];
        const user = {
            firstName: r.firstName,
            lastName: r.lastName,
            preferredName: r.preferredName,
            email: r.email,
            isRsm: !!(r.isRsm === true || r.isRsm === 1 || r.isRsm === '1'),
            isAll: !!(r.isAll === true || r.isAll === 1 || r.isAll === '1'),
            isAdmin: !!(r.isAdmin === true || r.isAdmin === 1 || r.isAdmin === '1')
        };
        res.json({ user });
    });
}, cleanupConnection);


router.post('/users', withConnection, (req, res) => {
    const { firstName, lastName, preferredName = '', email, isRsm = false, isAll = false, isAdmin = false } = req.body || {};
    if (!firstName || !lastName || !email) return res.status(400).json({ error: 'firstName, lastName, email required' });

    const sql = `
        INSERT INTO "BTP_INTERFACE#BTP"."USER_ACCOUNTS"
            ("FIRST_NAME","LAST_NAME","PREFERRED_NAME","EMAIL","RSM","ALL_FLAG","ADMIN_FLAG")
        VALUES (?,?,?,?,?,?,?)
    `;
    const params = [firstName, lastName, preferredName, email, toBit(isRsm), toBit(isAll), toBit(isAdmin)];

    req.hanaConn.exec(sql, params, (err) => {
        if (err) return res.status(500).json({ error: 'Failed to create user', details: err.message });
        res.status(201).json({ ok: true });
    });
}, cleanupConnection);


router.put('/users/:email', withConnection, (req, res) => {
    const email = (req.params.email || '').trim();
    if (!email) return res.status(400).json({ error: 'email param required' });

    const {
        firstName,
        lastName,
        preferredName = '',
        isRsm = false,
        isAll = false,
        isAdmin = false
    } = req.body || {};

    const sql = `
        UPDATE "BTP_INTERFACE#BTP"."USER_ACCOUNTS"
        SET "FIRST_NAME"=?, "LAST_NAME"=?, "PREFERRED_NAME"=?, "RSM"=?, "ALL_FLAG"=?, "ADMIN_FLAG"=?
        WHERE LOWER("EMAIL") = LOWER(?)
    `;
    const params = [
        firstName,
        lastName,
        preferredName,
        toBit(isRsm),
        toBit(isAll),
        toBit(isAdmin),
        email
    ];

    req.hanaConn.exec(sql, params, (err) => {
        if (err) return res.status(500).json({ error: 'Failed to update user', details: err.message });
        res.json({ ok: true });
    });
}, cleanupConnection);

router.get('/users/pending', withConnection, (req, res) => {
    const sql = `
        SELECT
            "FIRST_NAME"     AS "firstName",
            "LAST_NAME"      AS "lastName",
            "PREFERRED_NAME" AS "preferredName",
            "EMAIL"          AS "email",
            "RSM"            AS "isRsm",
            "ALL_FLAG"       AS "isAll",
            "ADMIN_FLAG"     AS "isAdmin"
        FROM "BTP_INTERFACE#BTP"."USER_ACCOUNTS_PENDING"
        ORDER BY "LAST_NAME","FIRST_NAME"
    `;
    req.hanaConn.exec(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch pending users', details: err.message });
        res.json(rows || []);
    });
}, cleanupConnection);

router.post('/users/pending', withConnection, (req, res) => {
    const { firstName, lastName, preferredName = '', email, isRsm = false, isAll = false, isAdmin = false } = req.body || {};
    if (!firstName || !lastName || !email) return res.status(400).json({ error: 'firstName, lastName, email required' });

    const insertSql = `
        INSERT INTO "BTP_INTERFACE#BTP"."USER_ACCOUNTS_PENDING"
            ("FIRST_NAME","LAST_NAME","PREFERRED_NAME","EMAIL","RSM","ALL_FLAG","ADMIN_FLAG")
        VALUES (?,?,?,?,?,?,?)
    `;
    const insertParams = [firstName, lastName, preferredName || '', email.trim(), toBit(isRsm), toBit(isAll), toBit(isAdmin)];

    req.hanaConn.exec(insertSql, insertParams, (insErr) => {
        if (!insErr) return res.status(201).json({ ok: true, action: 'inserted_new' });

        const isDuplicate = /duplicate|unique/i.test(insErr.message || '');
        if (!isDuplicate) return res.status(500).json({ error: 'Failed to create pending user', details: insErr.message });

        const updateSql = `
            UPDATE "BTP_INTERFACE#BTP"."USER_ACCOUNTS_PENDING"
            SET "FIRST_NAME"=?, "LAST_NAME"=?, "PREFERRED_NAME"=?, "RSM"=?, "ALL_FLAG"=?, "ADMIN_FLAG"=?
            WHERE LOWER("EMAIL") = LOWER(?)
        `;
        const updateParams = [firstName, lastName, preferredName || '', toBit(isRsm), toBit(isAll), toBit(isAdmin), email.trim()];
        req.hanaConn.exec(updateSql, updateParams, (updErr) => {
            if (updErr) return res.status(500).json({ error: 'Failed to update pending user', details: updErr.message });
            return res.json({ ok: true, action: 'updated_existing' });
        });
    });
}, cleanupConnection);


router.delete('/users/pending/:email', withConnection, (req, res) => {
    const email = (req.params.email || '').trim();
    if (!email) return res.status(400).json({ error: 'email param required' });

    const sql = `DELETE FROM "BTP_INTERFACE#BTP"."USER_ACCOUNTS_PENDING" WHERE LOWER("EMAIL") = LOWER(?)`;
    req.hanaConn.exec(sql, [email], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to delete pending user', details: err.message });
        res.json({ ok: true });
    });
}, cleanupConnection);

// Approve pending user (move from pending to active)
router.post('/users/pending/approve', withConnection, (req, res) => {
    const { email, isRsm = false, isAll = false, isAdmin = false } = req.body || {};
    
    if (!email) {
        return res.status(400).json({ error: 'email is required' });
    }

    // First, get the pending user data
    const getPendingUserSql = `
        SELECT "FIRST_NAME", "LAST_NAME", "PREFERRED_NAME", "EMAIL"
        FROM "BTP_INTERFACE#BTP"."USER_ACCOUNTS_PENDING"
        WHERE LOWER("EMAIL") = LOWER(?)
        LIMIT 1
    `;

    req.hanaConn.exec(getPendingUserSql, [email], (err, pendingUser) => {
        if (err) {
            console.error('Error fetching pending user:', err);
            return res.status(500).json({ 
                error: 'Failed to fetch pending user', 
                details: err.message 
            });
        }

        if (!pendingUser || pendingUser.length === 0) {
            return res.status(404).json({ error: 'Pending user not found' });
        }

        const user = pendingUser[0];

        // Insert into active users table
        const insertActiveUserSql = `
            INSERT INTO "BTP_INTERFACE#BTP"."USER_ACCOUNTS"
                ("FIRST_NAME", "LAST_NAME", "PREFERRED_NAME", "EMAIL", "RSM", "ALL_FLAG", "ADMIN_FLAG")
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const insertParams = [
            user.FIRST_NAME,
            user.LAST_NAME, 
            user.PREFERRED_NAME,
            user.EMAIL,
            toBit(isRsm),
            toBit(isAll),
            toBit(isAdmin)
        ];

        req.hanaConn.exec(insertActiveUserSql, insertParams, (insertErr) => {
            if (insertErr) {
                console.error('Error inserting active user:', insertErr);
                return res.status(500).json({ 
                    error: 'Failed to approve user', 
                    details: insertErr.message 
                });
            }

            // Delete from pending users table
            const deletePendingUserSql = `
                DELETE FROM "BTP_INTERFACE#BTP"."USER_ACCOUNTS_PENDING"
                WHERE LOWER("EMAIL") = LOWER(?)
            `;

            req.hanaConn.exec(deletePendingUserSql, [email], (deleteErr) => {
                if (deleteErr) {
                    console.error('Error deleting pending user:', deleteErr);
                    // Note: User is already approved, so we don't return an error here
                    // Just log it for debugging
                }

                console.log(`Successfully approved user: ${email}`);
                res.json({ 
                    ok: true, 
                    message: 'User approved successfully',
                    email: email,
                    roles: { isRsm, isAll, isAdmin }
                });
            });
        });
    });
}, cleanupConnection);
router.get('/overrideprice', withConnection, (req, res) => {
    console.log('Fetching override price data from override_price_tracker');

    try {
        const sql = `
            SELECT
                OPPORTUNITY_ID,
                CURRENT_PRICE,
                OVERRIDE_PRICE,
                BUSINESS_JUSTIFICATION,
                DATE_OF_REQUEST,
                DATE_OF_APPROVAL,
                APPROVAL_NOTE,
                REQUESTOR
            FROM "BTP_INTERFACE#BTP"."OVERRIDEPRICE_TRACKER"
        `;

        req.hanaConn.exec(sql, [], (err, result) => {
            if (err) {
                console.error('Query error:', err);
                return res.status(500).json({
                    error: 'Failed to fetch override price data',
                    details: err.message
                });
            }

            console.log('Successfully fetched override price data');
            res.json(result || []);
        });
    } catch (error) {
        console.error('Error processing override price request:', error);
        return res.status(500).json({
            error: 'Failed to process override price request',
            details: error.message
        });
    }
}, cleanupConnection);

router.post('/overrideprice', withConnection, (req, res) => {
    console.log('Inserting override price data into override_price_tracker');

    try {
        const {
            Oppertunity_ID,
            CurrentPrice,
            OverridePrice,
            BusinessJustification,
            DateOfRequest,
            DateOfApproval,
            ApprovalNote,
            Requestor
        } = req.body;

        // Basic validation
        if (!Oppertunity_ID) {
            return res.status(400).json({ error: 'Oppertunity_ID is required' });
        }

        const sql = `
            INSERT INTO "BTP_INTERFACE#BTP"."OVERRIDEPRICE_TRACKER"
                (OPPORTUNITY_ID, CURRENT_PRICE, OVERRIDE_PRICE, BUSINESS_JUSTIFICATION, DATE_OF_REQUEST, DATE_OF_APPROVAL, APPROVAL_NOTE, REQUESTOR)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            Oppertunity_ID,
            CurrentPrice || null,
            OverridePrice || null,
            BusinessJustification || null,
            DateOfRequest || null,
            DateOfApproval || null,
            ApprovalNote || null,
            Requestor || null
        ];

        req.hanaConn.exec(sql, values, (err, result) => {
            if (err) {
                console.error('Insert error:', err);
                return res.status(500).json({
                    error: 'Failed to insert override price data',
                    details: err.message
                });
            }

            console.log('Successfully inserted override price data');
            res.status(201).json({
                message: 'Override price data inserted successfully',
                data: { Oppertunity_ID }
            });
        });
    } catch (error) {
        console.error('Error processing override price insert:', error);
        return res.status(500).json({
            error: 'Failed to process override price insert',
            details: error.message
        });
    }
}, cleanupConnection);


module.exports = router;