export const ONBOARDING_STORAGE_KEY = "lumaloop-onboarding-v1";

export function clearOnboardingProgress() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}
