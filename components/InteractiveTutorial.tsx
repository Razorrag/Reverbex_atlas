import React, { useState, useEffect } from 'react';

interface TutorialStep {
    title: string;
    description: string;
    target?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    highlight?: boolean;
}

const tutorialSteps: TutorialStep[] = [
    {
        title: "Welcome to ReverbEx Atlas! 🚀",
        description: "This interactive guide will show you how to align satellite images using AI. Let's get started!",
    },
    {
        title: "Step 1: Upload Images 📸",
        description: "Upload two GeoTIFF satellite images here. You can also click 'Load Sample Dataset' to try it instantly!",
        target: "upload-panel",
        position: "right",
        highlight: true,
    },
    {
        title: "Step 2: View on Maps 🗺️",
        description: "Your images will appear on these synchronized maps. Zoom and pan - both maps move together!",
        target: "map-view",
        position: "left",
        highlight: true,
    },
    {
        title: "Step 3: Draw Area of Interest 🎯",
        description: "Use the drawing tool (top-left of map) to select which area you want to align.",
        target: "map-view",
        position: "bottom",
        highlight: true,
    },
    {
        title: "Step 4: Start AI Alignment 🤖",
        description: "Once you have both images and an AOI, click 'Start AI Alignment' to process!",
        target: "process-button",
        position: "right",
        highlight: true,
    },
    {
        title: "Step 5: View Results ✨",
        description: "Watch the magic happen! Your images will be perfectly aligned using advanced AI algorithms.",
        target: "map-view",
        position: "top",
        highlight: true,
    },
    {
        title: "You're All Set! 🎉",
        description: "You now know how to use ReverbEx Atlas. Click 'Finish' to start exploring!",
    },
];

interface InteractiveTutorialProps {
    onClose: () => void;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const step = tutorialSteps[currentStep];
    const isLastStep = currentStep === tutorialSteps.length - 1;
    const isFirstStep = currentStep === 0;

    useEffect(() => {
        // Add highlight to target element
        if (step.target && step.highlight) {
            const element = document.getElementById(step.target);
            if (element) {
                element.classList.add('tutorial-highlight');
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        return () => {
            // Remove highlight when step changes
            if (step.target) {
                const element = document.getElementById(step.target);
                if (element) {
                    element.classList.remove('tutorial-highlight');
                }
            }
        };
    }, [currentStep, step.target, step.highlight]);

    const handleNext = () => {
        if (isLastStep) {
            handleClose();
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (!isFirstStep) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleSkip = () => {
        handleClose();
    };

    if (!isVisible) return null;

    // Calculate position based on target element
    const getTooltipPosition = () => {
        if (!step.target) {
            // Center modal for steps without target
            return {
                position: 'fixed' as const,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxWidth: '500px',
                width: '90%',
            };
        }

        // For steps with targets, position near the element
        return {
            position: 'fixed' as const,
            top: step.position === 'bottom' ? 'auto' : '50%',
            bottom: step.position === 'bottom' ? '100px' : 'auto',
            left: step.position === 'right' ? '420px' : step.position === 'left' ? 'auto' : '50%',
            right: step.position === 'left' ? '100px' : 'auto',
            transform: !step.target ? 'translate(-50%, -50%)' : step.position === 'top' || (!step.position) ? 'translateY(-50%)' : 'none',
            maxWidth: '400px',
                            </div >
    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                        </div >
    <p className="text-gray-300 leading-relaxed">{step.description}</p>
                    </div >
    <button
        onClick={handleSkip}
        className="ml-4 text-gray-400 hover:text-white transition-colors"
        aria-label="Close tutorial"
    >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
                </div >

    {/* Progress Indicator */ }
    < div className = "mb-4" >
                    <div className="flex space-x-1">
                        {tutorialSteps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${index <= currentStep
                                        ? 'bg-gradient-to-r from-cyan-400 to-purple-400'
                                        : 'bg-slate-700'
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        Step {currentStep + 1} of {tutorialSteps.length}
                    </p>
                </div >

    {/* Navigation Buttons */ }
    < div className = "flex items-center justify-between space-x-3" >
                    <button
                        onClick={handleSkip}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        Skip Tutorial
                    </button>

                    <div className="flex space-x-2">
                        {!isFirstStep && (
                            <button
                                onClick={handlePrevious}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                            >
                                Previous
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/50 text-sm font-medium"
                        >
                            {isLastStep ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div >
            </div >

    {/* Global Styles for Highlight Effect */ }
    < style > {`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .tutorial-highlight {
          position: relative;
          z-index: 9997 !important;
          box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.4), 0 0 30px rgba(34, 211, 238, 0.3) !important;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .tutorial-highlight::before {
          content: '';
          position: absolute;
          inset: -8px;
          border: 2px dashed rgba(34, 211, 238, 0.5);
          border-radius: 12px;
          animation: dash 20s linear infinite;
        }

        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style >
        </>
    );
};

export default InteractiveTutorial;
