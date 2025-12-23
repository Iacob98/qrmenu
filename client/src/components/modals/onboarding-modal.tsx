import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OnboardingStep {
  images: string[];
  titleKey: string;
  textKey: string;
}

const steps: OnboardingStep[] = [
  { images: ["/onboarding/1.jpg", "/onboarding/2.jpg"], titleKey: "onboardingStep1Title", textKey: "onboardingStep1Text" },
  { images: ["/onboarding/3.jpg", "/onboarding/4.jpg"], titleKey: "onboardingStep2Title", textKey: "onboardingStep2Text" },
  { images: ["/onboarding/5.jpg", "/onboarding/6.jpg"], titleKey: "onboardingStep3Title", textKey: "onboardingStep3Text" },
  { images: ["/onboarding/7.jpg", "/onboarding/8.jpg"], titleKey: "onboardingStep4Title", textKey: "onboardingStep4Text" },
  { images: ["/onboarding/9.jpg", "/onboarding/10.jpg"], titleKey: "onboardingStep5Title", textKey: "onboardingStep5Text" },
  { images: ["/onboarding/11.jpg"], titleKey: "onboardingStep6Title", textKey: "onboardingStep6Text" },
  { images: ["/onboarding/12.jpg"], titleKey: "onboardingStep7Title", textKey: "onboardingStep7Text" },
  { images: ["/onboarding/13.jpg", "/onboarding/14.jpg"], titleKey: "onboardingStep8Title", textKey: "onboardingStep8Text" },
];

export function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
  const { t } = useTranslation();
  const { markOnboarded } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = async () => {
    if (isClosing) return;
    setIsClosing(true);
    try {
      await markOnboarded();
    } catch (error) {
      console.error("Failed to mark as onboarded:", error);
    }
    onOpenChange(false);
    setIsClosing(false);
    setCurrentStep(0);
  };

  const handleSkip = () => {
    handleClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {t("onboardingTitle")}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Images Carousel */}
          <div className="relative mb-4">
            {step.images.length > 1 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {step.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <img
                          src={image}
                          alt={`Step ${currentStep + 1} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            ) : (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={step.images[0]}
                  alt={`Step ${currentStep + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {currentStep + 1}/{steps.length}
            </span>
          </div>

          {/* Step Content */}
          <div className="space-y-3 pb-4">
            <h3 className="text-lg font-semibold">{t(step.titleKey)}</h3>
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {t(step.textKey)}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isClosing}
          >
            {t("onboardingSkip")}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0 || isClosing}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("back")}
            </Button>
            <Button
              onClick={handleNext}
              disabled={isClosing}
            >
              {isLastStep ? t("onboardingFinish") : t("next")}
              {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
