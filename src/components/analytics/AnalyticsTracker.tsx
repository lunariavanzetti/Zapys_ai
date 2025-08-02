import React, { useEffect, useRef } from 'react';
import { useAnalyticsTracking } from '../../hooks/useAnalytics';

interface AnalyticsTrackerProps {
  proposalId: string;
  children: React.ReactNode;
  trackSections?: boolean;
  trackClicks?: boolean;
  trackTime?: boolean;
}

export const AnalyticsTracker: React.FC<AnalyticsTrackerProps> = ({
  proposalId,
  children,
  trackSections = true,
  trackClicks = true,
  trackTime = true
}) => {
  const { trackClick, trackCustomEvent } = useAnalyticsTracking(proposalId);
  const containerRef = useRef<HTMLDivElement>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const sectionTimesRef = useRef<Map<string, number>>(new Map());

  // Set up intersection observer for section tracking
  useEffect(() => {
    if (!trackSections || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.getAttribute('data-section');
          if (!sectionId) return;

          if (entry.isIntersecting) {
            // Section entered view
            sectionTimesRef.current.set(sectionId, Date.now());
            trackCustomEvent('section_view', { section: sectionId });
          } else {
            // Section left view
            const startTime = sectionTimesRef.current.get(sectionId);
            if (startTime) {
              const timeSpent = (Date.now() - startTime) / 1000;
              trackCustomEvent('section_exit', { 
                section: sectionId, 
                timeSpent 
              });
              sectionTimesRef.current.delete(sectionId);
            }
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of the section is visible
        rootMargin: '0px 0px -50px 0px'
      }
    );

    intersectionObserverRef.current = observer;

    // Observe all sections
    const sections = containerRef.current.querySelectorAll('[data-section]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [trackSections, trackCustomEvent]);

  // Set up click tracking
  useEffect(() => {
    if (!trackClicks || !containerRef.current) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const section = target.closest('[data-section]')?.getAttribute('data-section') || 'unknown';
      
      // Determine element type
      let elementType = target.tagName.toLowerCase();
      if (target.classList.contains('cta-button')) elementType = 'cta-button';
      else if (target.classList.contains('download-link')) elementType = 'download-link';
      else if (target.tagName === 'A') elementType = 'link';
      else if (target.tagName === 'BUTTON') elementType = 'button';

      trackClick(section, elementType, {
        text: target.textContent?.slice(0, 100),
        href: target.getAttribute('href'),
        className: target.className
      });
    };

    containerRef.current.addEventListener('click', handleClick);

    return () => {
      containerRef.current?.removeEventListener('click', handleClick);
    };
  }, [trackClicks, trackClick]);

  return (
    <div ref={containerRef} className="analytics-tracked">
      {children}
    </div>
  );
};

// Higher-order component for tracking
export const withAnalyticsTracking = <P extends object>(
  Component: React.ComponentType<P>,
  proposalId: string
) => {
  return (props: P) => (
    <AnalyticsTracker proposalId={proposalId}>
      <Component {...props} />
    </AnalyticsTracker>
  );
};

// Hook for manual event tracking within tracked components
export const useManualTracking = (proposalId: string) => {
  const { trackClick, trackDownload, trackSignature, trackCustomEvent } = useAnalyticsTracking(proposalId);

  const trackButtonClick = (buttonName: string, section: string = 'unknown') => {
    trackClick(section, 'button', { buttonName });
  };

  const trackLinkClick = (linkText: string, href: string, section: string = 'unknown') => {
    trackClick(section, 'link', { linkText, href });
  };

  const trackFormSubmission = (formName: string, section: string = 'unknown') => {
    trackCustomEvent('form_submit', { formName, section });
  };

  const trackVideoPlay = (videoTitle: string, section: string = 'unknown') => {
    trackCustomEvent('video_play', { videoTitle, section });
  };

  const trackVideoComplete = (videoTitle: string, duration: number, section: string = 'unknown') => {
    trackCustomEvent('video_complete', { videoTitle, duration, section });
  };

  const trackPDFDownload = (fileName: string, section: string = 'unknown') => {
    trackDownload('pdf');
    trackCustomEvent('pdf_download', { fileName, section });
  };

  const trackProposalSignature = (signatureType: 'electronic' | 'wet' = 'electronic') => {
    trackSignature();
    trackCustomEvent('proposal_signed', { signatureType });
  };

  return {
    trackButtonClick,
    trackLinkClick,
    trackFormSubmission,
    trackVideoPlay,
    trackVideoComplete,
    trackPDFDownload,
    trackProposalSignature,
    trackCustomEvent
  };
};