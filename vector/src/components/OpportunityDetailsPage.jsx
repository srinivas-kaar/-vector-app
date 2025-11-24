import { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../App";
import {
  apiFetchIndustrySegement,
  apiFetchMaterials,
  apiFetchOpportunityTypes,
  apiFetchProbability,
  apiFetchProductCategory,
  apiFetchSalesStage,
  apiFetchWinLoseCodes,
} from "../api";
import { getLastUpdated, toISODate } from "../utils";
import { Card } from "../ui/common/Card";
import { CardBody } from "../ui/common/CardBody";
import { Button } from "../ui/common/Button";
import { CardHeader } from "../ui/common/CardHeader";
import { Label } from "../ui/common/Label";
import { Input } from "../ui/common/Input";
import { FrostedSelect } from "../ui/common/FrostedSelect";
import { FrostedSelectMaterialID } from "../ui/common/FrostedSelectMaterialID";
import { Textarea } from "../ui/common/Textarea";
import { FrostedDate } from "../ui/common/FrostedDate";
import { ConfirmationModal } from "./ConfirmationModal";
import { QuantityModal } from "./QuantityModal";

export function OpportunityDetailsPage({ opp, onBack, onSave }) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  const [form, setForm] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [currentSection, setCurrentSection] = useState("product");
  const [materials, setMaterials] = useState([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [materialsError, setMaterialsError] = useState(null);
  const [salesStages, setSalesStages] = useState("");
  const [industrySegment, setIndustrySegment] = useState("");
  const [probability, setProbability] = useState("");
  const [opportunityType, setOpportunityType] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [winLoseCode, setWinLoseCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pendingValue, setPendingValue] = useState("");
  const [errors, setErrors] = useState({});
  const [quantityModal, setQuantityModal] = useState(false);

  const isMaterialRequired = form.probability !== "0%";
  const startDate = form.likely_Start_Date;
  const volume = form.estimated_Volume;

  console.log({ form });

  useEffect(() => {
    async function loadSalesStages() {
      try {
        const res = await apiFetchSalesStage();
        const formatted = res.map((item) => item.SALESSTAGE);
        setSalesStages(formatted);
      } catch (err) {
        console.error("Error loading sales stages:", err);
        setSalesStages([]);
      }
    }

    loadSalesStages();
  }, []);

  useEffect(() => {
    async function loadProbability() {
      try {
        const res = await apiFetchProbability();
        const formatted = res.map((item) => item.PROBABILITYPCT);
        setProbability(formatted);
      } catch (err) {
        console.error("Error loading probability:", err);
        setProbability("");
      }
    }

    loadProbability();
  }, []);
  useEffect(() => {
    async function loadProductCategory() {
      try {
        const res = await apiFetchProductCategory();
        console.log(res);
        const formatted = res.map((item) => item.CATEGORY);
        setProductCategory(formatted);
      } catch (err) {
        console.error("Error loading product category:", err);
        setProductCategory("");
      }
    }

    loadProductCategory();
  }, []);
  useEffect(() => {
    async function loadOpportunityType() {
      try {
        const res = await apiFetchOpportunityTypes();
        console.log(res);
        const formatted = res.map((item) => item.TYPE);
        setOpportunityType(formatted);
      } catch (err) {
        console.error("Error loading opportunity type:", err);
        setOpportunityType("");
      }
    }

    loadOpportunityType();
  }, []);
  useEffect(() => {
    async function loadWinLoseCodes() {
      try {
        const res = await apiFetchWinLoseCodes();
        console.log(res);
        const formatted = res.map((item) => item.CODE);
        setWinLoseCode(formatted);
      } catch (err) {
        console.error("Error loading opportunity type:", err);
        setWinLoseCode("");
      }
    }

    loadWinLoseCodes();
  }, []);
  useEffect(() => {
    async function loadIndustrySegment() {
      try {
        const res = await apiFetchIndustrySegement();
        console.log(res);
        const formatted = res.map((item) => item.SEGMENT);
        setIndustrySegment(formatted);
      } catch (err) {
        console.error("Error loading opportunity type:", err);
        setIndustrySegment("");
      }
    }

    loadIndustrySegment();
  }, []);

  const handleOverrideChange = () => {
    const override = parseFloat(form.override_Price);
    const projected = parseFloat(form.material_Price);
    setPendingValue(override);

    if (override < projected && form.business_justification) {
      setShowModal((prev) => !prev);
    }
  };

  const handleAnnual_LTO = (e) => {
    const startDate = typeof e === "string" ? e : e?.target?.value;
    if (!startDate) return;

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 363);

    const formattedEnd = end.toISOString().split("T")[0];

    setForm((prev) => ({
      ...prev,
      likely_Start_Date: startDate,
      end_Date: prev.annual_Or_LTO === "Annual" ? formattedEnd : "",
    }));
  };

  const handleTotalUpdate = (newTotal) => {
    setForm((prev) => ({
      ...prev,
      estimated_Volume: newTotal,  
    }));       
};

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setIsLoadingMaterials(true);
        const data = await apiFetchMaterials();
        setMaterials(Array.isArray(data) ? data : []);
        setMaterialsError(null);
      } catch (e) {
        setMaterials([]);
        setMaterialsError("Failed to load products");
      } finally {
        setIsLoadingMaterials(false);
      }
    };
    fetchMaterials();
  }, []);

  const productList = useMemo(
    () =>
      materials
        .map((m) => m.PRODUCT)
        .filter(Boolean)
        .sort(),
    [materials]
  );

  const sections = [
    { key: "product", label: "Product", icon: "📦" },
    { key: "volume_pricing", label: "Volume & Pricing", icon: "📊" },
    { key: "location_timing", label: "Location and Timing", icon: "📅" },
    { key: "outcome", label: "Outcome", icon: "📝" },
    { key: "customerDetails", label: "Customer Details", icon: "🤝" },
  ];
  const getSectionIndex = (key) => sections.findIndex((s) => s.key === key);
  const canGoNext = getSectionIndex(currentSection) < sections.length - 1;
  const canGoPrev = getSectionIndex(currentSection) > 0;
  const goToNextSection = () => {
    const idx = getSectionIndex(currentSection);
    if (idx < sections.length - 1) setCurrentSection(sections[idx + 1].key);
  };
  const goToPrevSection = () => {
    const idx = getSectionIndex(currentSection);
    if (idx > 0) setCurrentSection(sections[idx - 1].key);
  };

  useEffect(() => {
    if (opp) {
      setForm({
        // Core Details
        opportunity_ID: opp.opportunity_ID || opp.id || "",
        customer_Name: opp.customer_Name || opp.customerName || "",
        sales_Lead: opp.sales_Lead || opp.doleSalesLead || "",
        broker_Led: opp.broker_Led || "",
        industry_Segment: opp.industry_Segment || "",
        sales_Team: opp.sales_Team || opp.salesTeam || "",
        sales_Stage:
          opp.sales_Stage ||
          opp.salesStage ||
          opp.status ||
          "Lead: No Current Product Solution",
        probability: opp.probability || "",
        opportunity_Type: opp.opportunity_Type || opp.opportunityType || "",
        product_Category: opp.product_Category || opp.productCategory || "",
        material_ID: opp.material_ID || opp.materialId || "",
        material_Desc: opp.material_Desc || "",
        estimated_Volume: opp.estimated_Volume || opp.estimatedVolume || "",
        uoM: opp.uoM || opp.uom || "Case",
        opportunity_Summary:
          opp.opportunity_Summary || opp.opportunitySummary || "",

        // Product & Material
        product: opp.product || "",
        case_Volume_Converted:
          opp.case_Volume_Converted || opp.caseVolume || "",
        culinary_Needed: opp.culinary_Needed,
        base_UoM: opp.base_UoM || opp.materialBaseUnit || "Case",
        case_Volume: form.case_Volume || "",
        pound_Volume: form.pound_Volume || "",
        material_Price: opp.material_Price || "",
        override_Price: form.override_Price || "",
        topline_Revenue: form.topline_Revenue || "",
        ship_DC: form.ship_DC || "",
        likely_Distributors:
          opp.likely_Distributors || opp.likelyDistributors || "",
        annual_Or_LTO: opp.annual_Or_LTO || "Annual",
        likely_Start_Date:
          opp.likely_Start_Date || toISODate(opp.createdAt) || "",
        end_Date: opp.end_Date || toISODate(opp.closeDate) || "",
        last_Meeting_Date: opp.last_Meeting_Date || "",
        estimated_Close_Date: form.estimated_Close_Date || "",
        period_Rolling: form.period_Rolling || "",
        // Outcome & Notes
        win_Loss_Reason_Code: opp.win_Loss_Reason_Code || "",
        win_Loss_Comments: opp.win_Loss_Comments || "",
        // Customer Details
        customer_Contact_Name: form.customer_Contact_Name || "",
        customer_Contact_Title: form.customer_Contact_Title || "",
        customer_Contact_Email: form.costumer_Contact_Email || "",
        customer_Contact_Phone: form.customer_Customer_Phone || "",
      });
    }
  }, [opp]);

  const handleSave = () => {
    const updatedOpp = {
      ...opp,
      ...form,
      closeDate: form.end_Date ? new Date(form.end_Date) : opp.closeDate,
      amount: form.pipeline_Projected_Revenue || opp.amount,
    };
    onSave(updatedOpp);
    setEditMode(false);
    setCurrentSection("product");
  };

  useEffect(() => {
    if (form.material_Price && form.estimated_Volume) {
      const price = parseFloat(form.material_Price);
      const volume = parseFloat(form.estimated_Volume);
      if (!isNaN(price) && !isNaN(volume)) {
        const revenue = (price * volume).toFixed(2);
        setForm((prev) => ({ ...prev, pipeline_Projected_Revenue: revenue }));
      }
    }
  }, [form.material_Price, form.estimated_Volume]);

  const canEdit =
    opp &&
    !opp.sales_Stage?.includes("Post-pipeline: Win") &&
    !opp.sales_Stage?.includes("Post-pipeline: Loss");

  if (!opp) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-6 grid gap-6">
        <Card>
          <CardBody className="flex items-center justify-between">
            <div
              className={`text-sm ${
                isNight ? "text-white/70" : "text-gray-700"
              }`}
            >
              Opportunity not found.
            </div>
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
          </CardBody>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-6 grid gap-6">
      <div className="flex items-center justify-between">
        <div
          className={`text-sm ${isNight ? "text-white/70" : "text-gray-600"}`}
        >
          Opportunity #{opp.id} Details
        </div>
        <div className="flex gap-2">
          {canEdit && !editMode && (
            <Button onClick={() => setEditMode(true)}>Edit Details</Button>
          )}
          {!editMode && (
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
          )}
        </div>
      </div>

      {(editMode || canEdit) && (
        <div className="flex items-center justify-between gap-2 w-full">
          {sections.map((section) => {
            const selectedCls = isNight
              ? "bg-gradient-to-r from-[#C8102E] to-[#001489] text-white shadow-lg"
              : "bg-gradient-to-r from-[rgba(246,229,0,0.6)] to-[rgba(57,180,232,0.6)] text-gray-900 shadow-lg";
            const baseCls = isNight
              ? "bg-white/10 text-white/70 hover:bg-white/20"
              : "bg-white/40 text-gray-600 hover:bg-white/60";
            return (
              <button
                key={section.key}
                onClick={() => setCurrentSection(section.key)}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  section.key === currentSection ? selectedCls : baseCls
                }`}
              >
                <span style={{ fontSize: "16px" }}>{section.icon}</span>
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <Card noClip>
        <div
          className={`relative flex justify-between items-start p-4 border-b rounded-t-lg
    ${
      isNight
        ? "bg-white/10 border-white/25 text-white placeholder-white/50 focus:ring-[#F6E500] disabled:bg-white/5 disabled:text-white/50"
        : "bg-white/60 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#39B4E8] disabled:bg-gray-100 disabled:text-gray-500"
    }`}
        >
          <CardHeader
            title="Core Details"
            subtitle="Essential opportunity information"
          />

          <div className="text-right px-3 py-2 rounded-lg transition-colors">
            <h3 className="text-lg font-semibold leading-tight">
              Opportunity ID: <span className="text-blue-600">{opp.id}</span>
            </h3>

            <h4 className="text-xs mt-1 opacity-80">{getLastUpdated()}</h4>
          </div>
        </div>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="grid gap-1">
              <Label>Customer Name</Label>
              <Input
                value={form.customer_Name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    customer_Name: e.target.value,
                  }))
                }
                disabled={!editMode}
                readOnly={!editMode}
              />
            </label>
            {currentSection === "product" ? (
              <label className="grid gap-1">
                <Label>Sales Lead</Label>
                <Input
                  value={form.sales_Lead}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, sales_Lead: e.target.value }))
                  }
                  placeholder="Sales Lead"
                  disabled={!editMode}
                  readOnly
                />
              </label>
            ) : (
              ""
            )}
            <div className="flex items-center gap-1">
              <label className="flex items-center gap-1 cursor-pointer">
                <Input
                  type="checkbox"
                  checked={form.broker_Led === true}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      broker_Led: !prev.broker_Led,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                />
                <Label>Broker Led</Label>
              </label>
            </div>
            <label className="grid gap-1">
              <Label>Industry Segment</Label>
              <FrostedSelect
                value={form.industry_Segment}
                onChange={(v) =>
                  setForm((prev) => ({ ...prev, industry_Segment: v }))
                }
                options={industrySegment}
                placeholder="Select Industry Segment"
                disabled={!editMode}
                readOnly={!editMode}
              />
            </label>

            {currentSection === "product" ? (
              <label className="grid gap-1">
                <Label>Sales Team</Label>
                <Input
                  value={form.sales_Team}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, sales_Team: e.target.value }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </label>
            ) : (
              ""
            )}

            <label className="grid gap-1">
              <Label>Sales Stage</Label>
              <FrostedSelect
                value={form.sales_Stage}
                onChange={(v) =>
                  setForm((prev) => ({ ...prev, sales_Stage: v }))
                }
                options={salesStages}
                placeholder="Select sales stage"
                disabled={!editMode}
                readOnly={!editMode}
              />
            </label>
            <label className="grid gap-1">
              <Label>Probability</Label>
              <FrostedSelect
                value={form.probability}
                onChange={(v) =>
                  setForm((prev) => ({ ...prev, probability: v }))
                }
                options={probability}
                placeholder="Select Probability"
                readOnly={!editMode}
                disabled={!editMode}
              />
            </label>
            <label className="grid gap-1">
              <Label>Opportunity Type</Label>
              <FrostedSelect
                value={form.opportunity_Type}
                onChange={(v) =>
                  setForm((prev) => ({ ...prev, opportunity_Type: v }))
                }
                options={opportunityType}
                placeholder="Select Opportunit Type"
                readOnly={!editMode}
                disabled={!editMode}
              />
            </label>
            <label className="grid gap-1">
              <Label>Product Category</Label>
              <FrostedSelect
                value={form.product_Category}
                onChange={(v) =>
                  setForm((prev) => ({ ...prev, product_Category: v }))
                }
                options={productCategory}
                placeholder="Select Product Category"
                readOnly={!editMode}
                disabled={!editMode}
              />
            </label>
            <label key="material" className="grid gap-1">
              <Label>
                Material ID{" "}
                {isMaterialRequired && (
                  <span className="text-red-500 text-sm ml-1">*</span>
                )}
              </Label>

              {isLoadingMaterials ? (
                <div className="px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-500">
                  Loading products...
                </div>
              ) : materialsError ? (
                <div className="px-3 py-2 rounded-xl border border-red-300 bg-red-50 text-red-600">
                  {materialsError}
                </div>
              ) : (
                <div className="w-full max-w-2xl">
                  <FrostedSelectMaterialID
                    value={form.material_ID}
                    onChange={(v) => {
                      setForm((prev) => ({ ...prev, material_ID: v }));

                      if (v && materials?.length > 0) {
                        const selectedMaterial = materials.find(
                          (m) => m.MATERIAL_ID === v
                        );

                        if (selectedMaterial) {
                          setForm((prev) => ({
                            ...prev,
                            product: v,
                            material_Desc:
                              selectedMaterial.PRODUCT?.split("||")[0] || "",
                            material_ID: selectedMaterial.MATERIAL_ID,
                            material_Weight: selectedMaterial.MATERIAL_WEIGHT,
                            product_Category: selectedMaterial.PRODUCT_CATEGORY,
                            base_UoM: selectedMaterial.BASE_UOM,
                            material_Price:
                              selectedMaterial.MATERIAL_PROJECTED_PRICE,
                            pipeline_Projected_Revenue: prev.estimated_Volume
                              ? (
                                  parseFloat(
                                    selectedMaterial.MATERIAL_PROJECTED_PRICE ||
                                      0
                                  ) * parseFloat(prev.estimated_Volume || 0)
                                ).toFixed(2)
                              : "",
                          }));
                        }
                      }
                    }}
                    options={
                      Array.isArray(materials)
                        ? materials.map((m) => m.MATERIAL_ID)
                        : []
                    }
                    placeholder={
                      isMaterialRequired
                        ? "Select Material ID (Required)"
                        : "Select Material ID"
                    }
                    disabled={isLoadingMaterials || !editMode}
                    readOnly={!editMode}
                  />
                </div>
              )}

              {isMaterialRequired && !form.material_ID && (
                <p className="text-red-500 text-xs mt-1">
                  * Material ID is required when probability is not 100%
                </p>
              )}
            </label>
            <label className="grid gap-1">
              <Label>Material Desc</Label>
              <Input
                value={form.material_Desc}
                placeholder="Material Description"
                readOnly
                disabled
              />
            </label>
            <label className="grid gap-1">
              <Label>Volume</Label>
              <Input
                type="number"
                value={form.estimated_Volume}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    estimated_Volume: e.target.value,
                  }))
                }
                placeholder="Enter volume"
                readOnly={!editMode}
                disabled={!editMode}
              />
            </label>
            <label className="grid gap-1">
              <Label>UoM</Label>
              <FrostedSelect
                value={form.base_UoM}
                onChange={(v) => setForm((prev) => ({ ...prev, base_UoM: v }))}
                options={["Case", "LBS"]}
                placeholder="Select UOM"
                disabled={!editMode}
                readOnly={!editMode}
              />
            </label>
            <label className="grid gap-1 md:col-span-3">
              <Label>Opportunity Summary</Label>
              <Textarea
                value={form.opportunity_Summary}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    opportunity_Summary: e.target.value,
                  }))
                }
                disabled={!editMode}
                readOnly={!editMode}
                rows={3}
              />
            </label>
          </div>
        </CardBody>
      </Card>

      <Card noClip>
        <CardHeader
          title={sections.find((s) => s.key === currentSection)?.label}
          subtitle={`Section ${getSectionIndex(currentSection) + 1} of ${
            sections.length
          }`}
        />
        <CardBody>
          {currentSection === "product" && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <label className="grid gap-1">
                          <Label>Material ID</Label>
                          <Input
                            value={form.material_ID}
                            placeholder="Material ID"
                            readOnly
                            disabled
                          />
                        </label>
                        <label className="grid gap-1">
                          <Label>Material Description</Label>
                          <Input
                            value={form.material_Desc}
                            placeholder="Material Description"
                            readOnly
                            disabled
                          />
                        </label>
                        <label className="grid gap-1">
                          <Label>Category</Label>
                          <Input
                            value={form.product_Category}
                            placeholder="Category"
                            readOnly
                            disabled
                          />
                        </label>
                        <label className="grid gap-1">
                          <Label>Case Weight</Label>
                          <Input
                            type="number"
                            value={form.material_Weight}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                material_Weight: e.target.value,
                              }))
                            }
                            placeholder="Case Weight"
                            readOnly
                            disabled
                          />
                        </label>
                        <div className="flex items-center gap-1">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.culinary_Needed === true}
                              onChange={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  culinary_Needed: !prev.culinary_Needed,
                                }))
                              }
                            />
                            <Label>Culinary Needed</Label>
                          </label>
                        </div>
                      </div>
                    )}
          {currentSection === "volume_pricing" && (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <Label>Estimated Volume</Label>
                <Input
                  type="number"
                  value={form.estimated_Volume}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      estimated_Volume: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </label>
              <label className="grid gap-1">
                <Label>Base UOM</Label>
                {editMode ? (
                  <FrostedSelect
                    value={form.uoM}
                    onChange={(v) => setForm((prev) => ({ ...prev, uoM: v }))}
                    options={["Case", "LBS"]}
                    disabled={!editMode}
                    readOnly={!editMode}
                  />
                ) : (
                  <Input value={form.uoM} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1">
                <Label>Case Volume</Label>
                <Input
                  type="number"
                  value={form.case_Volume_Converted}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      case_Volume_Converted: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </label>
              <label className="grid gap-1">
                <Label>Pound Volume</Label>
                <Input
                  type="number"
                  value={form.pound_Volume}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      pound_Volume: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </label>
              <label className="grid gap-1">
                <Label>Material Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70">
                    $
                  </span>
                  <Input
                    type="number"
                    value={form.material_Price}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        material_Price: e.target.value,
                      }))
                    }
                    className="pl-6"
                    placeholder="0.00"
                    readOnly
                    disabled
                  />
                </div>
              </label>
              <label className="grid gap-1">
                <Label>Override Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70">
                    $
                  </span>
                  <Input
                    type="number"
                    value={form.override_Price}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        override_Price: e.target.value,
                      }))
                    }
                    className="pl-6"
                    placeholder="0.00"
                    readOnly={!editMode}
                    disabled={!editMode}
                  />
                </div>
              </label>
              {!isNaN(Number(form.override_Price)) &&
                !isNaN(Number(form.material_Price)) &&
                Number(form.override_Price) > 0 &&
                Number(form.override_Price) < Number(form.material_Price) && (
                  <label className="grid gap-1 md:col-span-2">
                    <Label>Business Justification</Label>
                    <Textarea
                      value={form.business_justification}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          business_justification: e.target.value,
                        }))
                      }
                      placeholder="Enter your reason"
                      rows={3}
                      disabled={!editMode}
                      readOnly={!editMode}
                    />
                  </label>
                )}
              <label className="grid gap-1">
                <Label>Topline Revenue</Label>
                <Input
                  type="number"
                  value={form.topline_Revenue}
                  placeholder="$0.00"
                  readOnly={!editMode}
                  disabled={!editMode}
                />
              </label>
            </div>
          )}

          <ConfirmationModal
            isOpen={showModal}
            title="Approval Required"
            message="Entered price is less than the projected price. This requires approval from an approver."
            onConfirm={() => {
              handleOverrideChange();
              setShowModal(false);
              goToNextSection();
            }}
            onCancel={() => {
              setShowModal(false);
            }}
          />

{currentSection === "location_timing" && (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <Label>Ship DC</Label>
                <FrostedSelect
                  value={form.ship_DC}
                  onChange={(v) => {
                    setForm((prev) => ({
                      ...prev,
                      ship_DC: v,
                    }));
                  }}
                  options={["India", "USA", "Japan"]}
                  placeholder="Select DC Location"
                />
              </label>
              <label className="grid gap-1">
                <Label>Likely Distributors</Label>
                <Input
                  value={form.likely_Distributors}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      likely_Distributors: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="grid gap-1">
                <Label>Annual or LTO</Label>
                <FrostedSelect
                  value={form.annual_Or_LTO}
                  onChange={(v) => {
                    setForm((prev) => ({
                      ...prev,
                      annual_Or_LTO: v,

                      end_Date: v === "Annual" ? "" : prev.end_Date,
                    }));

                    // Re-run date logic if we switch annual_Or_LTO from Annual to LTO
                    if (form.likely_Start_Date) {
                      handleAnnual_LTO({
                        target: { value: form.likely_Start_Date },
                      });
                    }

                    setErrors((prev) => ({ ...prev, end_Date: "" }));
                  }}
                  options={["Annual", "LTO"]}
                />
              </label>
              <label className="grid gap-1">
                <Label>Likely Start Date</Label>
                <FrostedDate
                  value={form.likely_Start_Date}
                  onChange={handleAnnual_LTO}
                  placeholder="Select Start Date"
                />
              </label>

              <label className="grid gap-1">
                <div className="flex items-center gap-1">
                  <Label>End Date</Label>
                  {form?.annual_Or_LTO === "LTO" && (
                    <span className="text-red-500">*</span>
                  )}
                </div>
                <FrostedDate
                  value={form.end_Date}
                  onChange={(v) => {
                    setForm((prev) => ({ ...prev, end_Date: v }));
                    setErrors((prev) => ({ ...prev, end_Date: "" }));
                  }}
                  required={form?.annual_Or_LTO === "LTO"}
                  placeholder="Select End Date"
                  error={errors.end_Date}
                />

                {errors.end_Date && (
                  <span className="text-red-500 text-sm">
                    {errors.end_Date}
                  </span>
                )}
              </label>

              <label className="grid gap-1">
                <Label>Date of Last Meeting</Label>
                <FrostedDate
                  value={form.last_Meeting_Date}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, last_Meeting_Date: v }))
                  }
                  placeholder="Select meeting date"
                />
              </label>
              <label className="grid gap-1">
                <Label>Estimated Close Date</Label>
                <FrostedDate
                  value={form.estimated_Close_Date}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, estimated_Close_Date: v }))
                  }
                  placeholder="Select closing date"
                />
              </label>
              <label className="grid gap-1">
                <Label>Period Rolling (Quantity)</Label>
                <div className="relative w-full">
                  <Input
                    type="number"
                    value={form.rollingQuantity}
                    disabled
                    className="w-full border rounded px-3 py-2 bg-gray-100 text-center"
                  />

                  <button
                    onClick={() => setQuantityModal(true)}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 underline text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Quantity
                  </button>
                </div>
              </label>
            </div>
          )}

          <QuantityModal
                      open={quantityModal}
                      onClose={() => setQuantityModal(false)}
                      start_date={startDate}
                      volume={volume}
                      onTotalUpdate={handleTotalUpdate}
                    />

          {currentSection === "outcome" && (
            <div className="grid grid-cols-1 gap-4">
              <label className="grid gap-1">
                <Label>Win/Loss Reason Code</Label>
                {editMode ? (
                  <FrostedSelect
                    value={form.win_Loss_Reason_Code}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, win_Loss_Reason_Code: v }))
                    }
                    options={winLoseCode}
                    disabled={!editMode}
                  />
                ) : (
                  <Input value={form.win_Loss_Reason_Code} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1">
                <Label>Win/Loss Comments</Label>
                <Textarea
                  value={form.win_Loss_Comments}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      win_Loss_Comments: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                  rows={4}
                />
              </label>
            </div>
          )}

          {currentSection === "support" && (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <Label>Culinary Support Needed</Label>
                {editMode ? (
                  <FrostedSelect
                    value={form.culinary_Needed}
                    onChange={(v) =>
                      setForm((prev) => ({
                        ...prev,
                        culinary_Needed: v,
                      }))
                    }
                    options={["Y", "N"]}
                    disabled={!editMode}
                  />
                ) : (
                  <Input
                    value={form.culinary_Needed === "Y" ? "Yes" : "No"}
                    disabled
                    readOnly
                  />
                )}
              </label>
              {(form.culinary_Needed === "Y" ||
                (!editMode && form.culinary_Support_Status)) && (
                <>
                  <label className="grid gap-1">
                    <Label>Culinary Support Status</Label>
                    <Input
                      value={form.culinary_Support_Status}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          culinary_Support_Status: e.target.value,
                        }))
                      }
                      disabled={!editMode}
                      readOnly={!editMode}
                    />
                  </label>
                  <label className="grid gap-1 md:col-span-2">
                    <Label>Culinary Support Description</Label>
                    <Textarea
                      value={form.culinary_Support_Description}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          culinary_Support_Description: e.target.value,
                        }))
                      }
                      disabled={!editMode}
                      readOnly={!editMode}
                      rows={2}
                    />
                  </label>
                </>
              )}
            </div>
          )}

          {currentSection === "customerDetails" && (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <Label>Contact Name</Label>
                <Input
                  value={form.contact_Name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contact_Name: e.target.value,
                    }))
                  }
                  placeholder="Contact Name"
                  disabled={!editMode}
                  readOnly={!!editMode}
                />
              </label>
              <label className="grid gap-1">
                <Label>Contact Title</Label>
                <Input
                  value={form.contact_Title}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contact_Title: e.target.value,
                    }))
                  }
                  placeholder="Contact Title"
                  disabled={!editMode}
                  readOnly={!!editMode}
                />
              </label>
              <label className="grid gap-1">
                <Label>Contact Email</Label>
                <Input
                  value={form.contact_Email}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contact_Email: e.target.value,
                    }))
                  }
                  placeholder="Contact Email"
                  disabled={!editMode}
                  readOnly={!!editMode}
                />
              </label>

              <label className="grid gap-1">
                <Label>Contact Phone</Label>
                <Input
                  value={form.contact_Phone}
                  type="number"
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contact_Phone: e.target.value,
                    }))
                  }
                  placeholder="Contact Phone"
                  disabled={!editMode}
                  readOnly={!!editMode}
                />
              </label>
            </div>
          )}
        </CardBody>
      </Card>

      {!canEdit && (
        <Card>
          <CardBody>
            <div
              className={`text-sm ${
                isNight ? "text-white/70" : "text-gray-600"
              }`}
            >
              This opportunity has reached {opp.sales_Stage} stage and cannot be
              edited.
            </div>
          </CardBody>
        </Card>
      )}

      {editMode && (
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              setEditMode(false);
              setCurrentSection("product");
            }}
          >
            Cancel Edit
          </Button>
          <div className="flex gap-2">
            {canGoPrev && (
              <Button variant="ghost" onClick={goToPrevSection}>
                Previous
              </Button>
            )}
            {canGoNext && <Button onClick={goToNextSection}>Next</Button>}
            {!canGoNext && <Button onClick={handleSave}>Save Changes</Button>}
          </div>
        </div>
      )}
    </main>
  );
}
