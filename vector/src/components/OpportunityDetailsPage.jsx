import { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../App";
import { apiFetchIndustrySegement, apiFetchMaterials, apiFetchOpportunityTypes, apiFetchProbability, apiFetchProductCategory, apiFetchSalesStage, apiFetchWinLoseCodes } from "../api";
import { toISODate } from "../utils";
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
  // const [quantityModal, setQuantityModal] = useState(false);

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
              Opportunity ID: <span className="text-blue-600">#123</span>
            </h3>

            <h4 className="text-xs mt-1 opacity-80">
              Last updated: Sep 12, 2025 · 3:45 PM
            </h4>
          </div>
        </div>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="grid gap-1">
              <Label>Customer Name</Label>
              {editMode ? (
                <Input
                  value={form.customer_Name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      customer_Name: e.target.value,
                    }))
                  }
                />
              ) : (
                <Input value={form.customer_Name} disabled readonly />
              )}
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
                {editMode ? (
                  <Input
                    type="checkbox"
                    checked={form.broker_Led === true}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        broker_Led: !prev.broker_Led,
                      }))
                    }
                  />
                ) : (
                  <Input
                    type="checkbox"
                    checked={form.broker_Led === true}
                    disabled
                    readonly
                  />
                )}

                <Label>Broker Led</Label>
              </label>
            </div>
            <label className="grid gap-1">
              <Label>Industry Segment</Label>
              {editMode ? (
                <FrostedSelect
                  value={form.industry_Segment}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, industry_Segment: v }))
                  }
                  options={industrySegment}
                  placeholder="Select Industry Segment"
                />
              ) : (
                <FrostedSelect
                  value={form.industry_Segment}
                  placeholder="Select Industry Segment"
                  disabled
                  readonly
                />
              )}
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
              {editMode ? (
                <FrostedSelect
                  value={form.sales_Stage}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, sales_Stage: v }))
                  }
                  options={salesStages}
                  placeholder="Select sales stage"
                />
              ) : (
                <Input value={form.sales_Stage} disabled readOnly />
              )}
            </label>
            <label className="grid gap-1">
              <Label>Probability</Label>
              {editMode ? (
                <FrostedSelect
                  value={form.probability}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, probability: v }))
                  }
                  options={probability}
                  placeholder="Select Probability"
                />
              ) : (
                <FrostedSelect value={form.probability} />
              )}
            </label>
            <label className="grid gap-1">
              <Label>Opportunity Type</Label>
              {editMode ? (
                <FrostedSelect
                  value={form.opportunity_Type}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, opportunity_Type: v }))
                  }
                  options={opportunityType}
                  placeholder="Select Opportunit Type"
                />
              ) : (
                <FrostedSelect value={form.opportunity_Type} />
              )}
            </label>
            <label className="grid gap-1">
              <Label>Product Category</Label>
              {editMode ? (
                <FrostedSelect
                  value={form.product_Category}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, product_Category: v }))
                  }
                  options={productCategory}
                  placeholder="Select Product Category"
                />
              ) : (
                <FrostedSelect value={form.product_Category} />
              )}
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
                  {editMode ? (
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
                              product_Category:
                                selectedMaterial.PRODUCT_CATEGORY,
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
                      disabled={isLoadingMaterials}
                    />
                  ) : (
                    <FrostedSelectMaterialID value={form.material_ID} />
                  )}
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
                <Label>Product</Label>
                {editMode ? (
                  isLoadingMaterials ? (
                    <div className="px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-500">
                      Loading products...
                    </div>
                  ) : materialsError ? (
                    <div className="px-3 py-2 rounded-xl border border-red-300 bg-red-50 text-red-600">
                      {materialsError}
                    </div>
                  ) : (
                    <FrostedSelect
                      value={form.product}
                      onChange={(v) => {
                        setForm((prev) => ({ ...prev, product: v }));
                        if (v && materials.length > 0) {
                          const selectedMaterial = materials.find(
                            (m) => m.PRODUCT === v
                          );
                          if (selectedMaterial) {
                            setForm((prev) => ({
                              ...prev,
                              product: v,
                              material_ID: selectedMaterial.MATERIAL_ID,
                              material_Weight: selectedMaterial.MATERIAL_WEIGHT,
                              product_Category:
                                selectedMaterial.PRODUCT_CATEGORY,
                              base_UoM: selectedMaterial.BASE_UOM,
                              material_Price: selectedMaterial.material_Price,
                              pipeline_Projected_Revenue: prev.estimated_Volume
                                ? (
                                    parseFloat(
                                      selectedMaterial.material_Price
                                    ) * parseFloat(prev.estimated_Volume)
                                  ).toFixed(2)
                                : prev.pipeline_Projected_Revenue,
                            }));
                          }
                        }
                      }}
                      options={productList}
                      disabled={!editMode || isLoadingMaterials}
                    />
                  )
                ) : (
                  <Input value={form.product} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1">
                <Label>Material ID</Label>
                <Input
                  value={form.material_ID}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      material_ID: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </label>
              <label className="grid gap-1">
                <Label>Product Category</Label>
                {editMode ? (
                  <FrostedSelect
                    value={form.product_Category}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, product_Category: v }))
                    }
                    options={[
                      "",
                      "Snacking",
                      "Beverage",
                      "Pantry",
                      "Frozen",
                      "Other",
                    ]}
                    disabled={!editMode}
                  />
                ) : (
                  <Input value={form.product_Category} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1">
                <Label>Base UoM</Label>
                {editMode ? (
                  <FrostedSelect
                    value={form.base_UoM}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, base_UoM: v }))
                    }
                    options={["Case", "Pound"]}
                    disabled={!editMode}
                  />
                ) : (
                  <Input value={form.base_UoM} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1">
                <Label>Material Weight</Label>
                <Input
                  type="number"
                  value={form.material_Weight}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      material_Weight: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </label>
              <label className="grid gap-1">
                <Label>Product Source Location</Label>
                <Input
                  value={form.product_Source_Location}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      product_Source_Location: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
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
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </label>
            </div>
          )}

          {currentSection === "volume" && (
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
                <Label>Unit of Measure</Label>
                {editMode ? (
                  <FrostedSelect
                    value={form.uoM}
                    onChange={(v) => setForm((prev) => ({ ...prev, uoM: v }))}
                    options={["Case", "Pallet", "Each", "Pound", "Kilogram"]}
                    disabled={!editMode}
                  />
                ) : (
                  <Input value={form.uoM} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1">
                <Label>Case Volume (Converted)</Label>
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
                <Label>Opportunity Volume Input</Label>
                <Input
                  type="number"
                  value={form.opportunity_Volume_Input}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      opportunity_Volume_Input: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </label>
              <label className="grid gap-1">
                <Label>30 Days Ship</Label>
                {editMode ? (
                  <FrostedSelect
                    value={form.days_30_Ship}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, days_30_Ship: v }))
                    }
                    options={["Y", "N"]}
                    disabled={!editMode}
                  />
                ) : (
                  <Input
                    value={form.days_30_Ship === "Y" ? "Yes" : "No"}
                    disabled
                    readOnly
                  />
                )}
              </label>
            </div>
          )}

          {currentSection === "pricing" && (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <Label>Material Projected Price</Label>
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
                    disabled={!editMode}
                    readOnly={!editMode}
                  />
                </div>
              </label>
              <label className="grid gap-1">
                <Label>Equivalized Pipeline LBS</Label>
                <Input
                  type="number"
                  value={form.equivalized_Pipeline_LBS}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      equivalized_Pipeline_LBS: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </label>
              <label className="grid gap-1">
                <Label>Pipeline Projected Revenue</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70">
                    $
                  </span>
                  <Input
                    type="number"
                    value={form.pipeline_Projected_Revenue}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        pipeline_Projected_Revenue: e.target.value,
                      }))
                    }
                    className="pl-6"
                    disabled={!editMode}
                    readOnly={!editMode}
                  />
                </div>
              </label>
            </div>
          )}

          {currentSection === "timing" && (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <Label>Likely Start Date</Label>
                {editMode ? (
                  <FrostedDate
                    value={form.likely_Start_Date}
                    onChange={(e) => handleAnnual_LTO(e)}
                    disabled={!editMode}
                  />
                ) : (
                  <Input value={form.likely_Start_Date} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1">
                <Label>End Date</Label>
                {editMode ? (
                  <FrostedDate
                    value={form.end_Date}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, end_Date: v }))
                    }
                    disabled={!editMode}
                  />
                ) : (
                  <Input value={form.end_Date} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1">
                <Label>Annual or LTO</Label>
                {editMode ? (
                  <FrostedSelect
                    value={form.annual_Or_LTO}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, annual_Or_LTO: v }))
                    }
                    options={["Annual", "LTO"]}
                    disabled={!editMode}
                  />
                ) : (
                  <Input value={form.annual_Or_LTO} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1">
                <Label>Date of Last Meeting</Label>
                {editMode ? (
                  <FrostedDate
                    value={form.last_Meeting_Date}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, last_Meeting_Date: v }))
                    }
                    disabled={!editMode}
                  />
                ) : (
                  <Input value={form.last_Meeting_Date} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1 md:col-span-2">
                <Label>Next Step Description</Label>
                <Textarea
                  value={form.next_Step_Description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      next_Step_Description: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                  rows={3}
                />
              </label>
            </div>
          )}

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