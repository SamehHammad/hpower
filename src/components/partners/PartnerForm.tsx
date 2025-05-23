"use client";

import { useLocale, useTranslations } from "next-intl";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import ProgressBar from "./ProgressBar";
import CompanyDetailsStep from "./CompanyDetailsStep";
import CoverageAndServicesStep from "./CoverageAndServicesStep";
import FinalStep from "./FinalStep";
import SuccessPopup from "./SuccessPopup";
import { sendContactForm } from "@/actions/sendMail";

interface FormValues {
  companyName: string;
  numberOfEmployees: string;
  contactPerson: string;
  contactEmail: string;
  companyWebsite: string;
  phoneNumber: string;
  message: string;
  selectedPlan: string;
  terms: boolean;
  companyLicense?: File | null;
}

const PartnerForm = () => {
  const t = useTranslations("PartnerForm");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const locale = useLocale();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    trigger,
    control,
    setValue,
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      companyName: "",
      numberOfEmployees: "",
      contactPerson: "",
      phoneNumber: "",
      contactEmail: "",
      companyWebsite: "",
      message: "",
      selectedPlan: "",
      terms: false,
      companyLicense: null,
    },
  });

  const formValues = watch();

  const section1Valid =
    formValues.companyName &&
    formValues.numberOfEmployees &&
    formValues.contactPerson &&
    formValues.contactEmail;

  // Updated section2Valid to include phone number validation
  const section2Valid =
    formValues.companyWebsite &&
    formValues.phoneNumber &&
    formValues.phoneNumber.length > 4 && // Ensure phone number is longer than country code (e.g., +971)
    selectedCities.length > 0 &&
    selectedServices.length > 0;

  const section3Valid = formValues.selectedPlan && formValues.terms;

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("company_name", data.companyName);
      formData.append("company_website", data.companyWebsite);
      formData.append("contact_person", data.contactPerson);
      formData.append("contact_email", data.contactEmail);
      formData.append("phone", data.phoneNumber || "");
      formData.append("number_employees", data.numberOfEmployees);
      formData.append("cities", selectedCities.join(","));
      formData.append("services", selectedServices.join(","));
      formData.append("plans", data.selectedPlan);
      formData.append("notes", data.message || "");
      if (data.companyLicense) {
        formData.append("licence", data.companyLicense);
      }

      console.log("Submitting data:", {
        ...formData,
        licence: data.companyLicense ? "[File]" : null,
      });

      const backendResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL_OLD}/become-partner`,
        {
          method: "POST",
          body: formData,
        }
      );

      const backendResult = await backendResponse.json();

      if (!backendResponse.ok) {
        throw new Error(backendResult.message || "Backend submission failed");
      }

      const emailFormData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== "companyLicense") {
          emailFormData.append(key, value.toString());
        }
      });
      emailFormData.append("selectedCitie", selectedCities.join(","));
      emailFormData.append("selectedService", selectedServices.join(","));

      const emailResult = await sendContactForm(emailFormData, locale);
      console.log("Email result:", emailResult);

      if (emailResult.success) {
        setIsSuccess(true);
        setShowSuccessPopup(true);
        toast.success(
          t("formSubmitted") || "Application submitted successfully!"
        );
      } else {
        console.warn("Email failed but backend succeeded:", emailResult.error);
        setIsSuccess(true);
        setShowSuccessPopup(true);
        toast.success(
          t("formSubmitted") || "Application submitted successfully!"
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      setIsSubmitting(false);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(
        errorMessage.includes("fetch")
          ? t("networkError") || "Network error. Please check your connection."
          : t("submissionError") || "Submission failed. Please try again."
      );
    } finally {
      if (!isSuccess) {
        setIsSubmitting(false);
      } else {
        setTimeout(() => {
          setIsSubmitting(false);
        }, 1000);
      }
    }
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    setIsSuccess(false);
    reset();
    setSelectedCities([]);
    setSelectedServices([]);
    setValue("selectedPlan", "");
    setFormStep(0);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];

    if (formStep === 0) {
      fieldsToValidate = [
        "companyName",
        "numberOfEmployees",
        "contactPerson",
        "contactEmail",
      ];
    } else if (formStep === 1) {
      fieldsToValidate = ["companyWebsite", "phoneNumber"];
    } else if (formStep === 2) {
      fieldsToValidate = ["selectedPlan", "terms"];
    }

    const isStepValid = await trigger(fieldsToValidate);

    const stepValidations = [section1Valid, section2Valid, section3Valid];

    if (isStepValid && stepValidations[formStep]) {
      setFormStep((current) => current + 1);
    } else {
      toast.error(t("fillRequiredFields") || "Please fill all required fields");
    }
  };

  const previousStep = () => {
    setFormStep((current) => current - 1);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-xl p-6 md:p-8"
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-mobile_header lg:text-header mb-3 text-interactive_color text-center"
        >
          {t("joinNetwork") || "Join Our Partner Network"}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-gray-600 mb-8 text-center max-w-2xl mx-auto"
        >
          {t("contactWithinDays") ||
            "Complete this form to join our network of service providers. Our team will contact you within 2 business days."}
        </motion.p>

        <ProgressBar step={formStep} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            {formStep === 0 && (
              <CompanyDetailsStep
                register={register}
                onPrev={previousStep}
                errors={errors}
                onNext={nextStep}
                isNextDisabled={!section1Valid}
              />
            )}

            {formStep === 1 && (
              <CoverageAndServicesStep
                register={register}
                control={control}
                errors={errors}
                onNext={nextStep}
                onPrev={previousStep}
                isNextDisabled={!section2Valid}
                selectedCities={selectedCities}
                setSelectedCities={setSelectedCities}
                selectedServices={selectedServices}
                setSelectedServices={setSelectedServices}
              />
            )}

            {formStep === 2 && (
              <FinalStep
                errors={errors}
                register={register}
                onPrev={previousStep}
                formValues={formValues}
                selectedCities={selectedCities}
                selectedServices={selectedServices}
                setValue={setValue}
                isSubmitting={isSubmitting}
                isSuccess={isSuccess}
              />
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      <AnimatePresence>
        {showSuccessPopup && <SuccessPopup onClose={closeSuccessPopup} />}
      </AnimatePresence>
    </div>
  );
};

export default PartnerForm;
