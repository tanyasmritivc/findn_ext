// Content script for Findn AI extension
// Scrapes profile data from LinkedIn and Instagram

class ProfileScraper {
  constructor() {
    this.platform = this.detectPlatform();
    this.setupMessageListener();
  }

  detectPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes("linkedin.com")) {
      return "linkedin";
    } else if (hostname.includes("instagram.com")) {
      return "instagram";
    }
    return "unknown";
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "scrapeProfile") {
        const profileData = this.scrapeCurrentProfile();
        sendResponse({ success: true, data: profileData });
      }
    });
  }

  scrapeCurrentProfile() {
    try {
      if (this.platform === "linkedin") {
        return this.scrapeLinkedInProfile();
      } else if (this.platform === "instagram") {
        return this.scrapeInstagramProfile();
      }
    } catch (err) {
      console.error("Error scraping profile:", err);
    }
    return { platform: "unknown" };
  }

  scrapeLinkedInProfile() {
    const profileData = {
      platform: "linkedin",
      name: "",
      headline: "",
      jobTitle: "",
      company: "",
      location: "",
      interests: "",
      recentActivity: "",
    };

    try {
      // Name
      profileData.name = this.getTextBySelectors([
        "h1.text-heading-xlarge",
        ".pv-text-details__left-panel h1",
        ".ph5 h1",
        "[data-anonymize='person-name']",
      ]);

      // Headline/Bio
      profileData.headline = this.getTextBySelectors([
        ".text-body-medium.break-words",
        ".pv-text-details__left-panel .text-body-medium",
        ".ph5 .text-body-medium",
      ]);

      // Job title
      profileData.jobTitle = this.getTextBySelectors([
        ".pv-text-details__left-panel .pvs-list__item--line-separated .mr1.t-bold span[aria-hidden='true']",
        ".experience-section .pv-entity__summary-info h3",
        ".pv-top-card .pv-top-card__list-bullet-entity",
      ]);

      // Company
      profileData.company = this.getTextBySelectors([
        ".pv-text-details__left-panel .pvs-list__item--line-separated .t-14.t-normal span[aria-hidden='true']",
        ".experience-section .pv-entity__secondary-title",
        ".pv-top-card .pv-top-card__list-bullet-entity-item",
      ]);

      // Location
      profileData.location = this.getTextBySelectors([
        ".pv-text-details__left-panel .text-body-small.inline.t-black--light.break-words",
        ".pv-top-card__list-bullet-entity .t-16.t-black.t-normal",
      ]);

      // Interests/Skills
      const skillsElements = document.querySelectorAll(
        ".pvs-list__item--line-separated .mr1.hoverable-link-text.t-bold span[aria-hidden='true']"
      );
      const skills = Array.from(skillsElements)
        .slice(0, 5)
        .map((el) => el.textContent.trim())
        .join(", ");
      profileData.interests = skills;

      // Recent Activity
      profileData.recentActivity = this.getTextBySelectors([
        ".pv-recent-activity-section .pv-entity__summary-info p",
        ".feed-shared-text .break-words span[dir='ltr']",
      ]);
    } catch (error) {
      console.error("Error scraping LinkedIn profile:", error);
    }

    return profileData;
  }

  scrapeInstagramProfile() {
    const profileData = {
      platform: "instagram",
      name: "",
      headline: "",
      jobTitle: "",
      company: "",
      location: "",
      interests: "",
      recentActivity: "",
    };

    try {
      // Username
      profileData.name = this.getTextBySelectors([
        "header section h2",
        "h1._7UhW9",
        "h2._7UhW9",
      ]);

      // Bio
      profileData.headline = this.getTextBySelectors([
        "header section div.-vDIg span",
        "div._aacl._aaco._aacw._aacx._aad7._aade", // newer IG bio selector
      ]);

      // Extract job title + company from bio
      const bio = profileData.headline;
      if (bio) {
        const jobMatch = bio.match(
          /(CEO|CTO|Manager|Engineer|Designer|Developer|Director|Founder|Co-founder|VP|President|Analyst|Consultant|Specialist|Coordinator|Lead|Senior|Junior|Associate)\s+(?:at|@)\s+([^|\n]+)/i
        );
        if (jobMatch) {
          profileData.jobTitle = jobMatch[1];
          profileData.company = jobMatch[2].trim();
        }
      }

      // Followers/Following/Posts
      const stats = this.getAllTextBySelectors([
        "header section ul li span",
        "header section ul li a span",
      ]).join(" • ");
      profileData.interests = stats;

      // Recent posts (alt text of images)
      const posts = this.getAllTextBySelectors([
        "article div img[alt]",
        "div._aagu img[alt]",
      ])
        .slice(0, 3)
        .map((t) => t.slice(0, 80)) // trim long alts
        .join(", ");
      profileData.recentActivity = posts;
    } catch (error) {
      console.error("Error scraping Instagram profile:", error);
    }

    return profileData;
  }

  getTextBySelectors(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    return "";
  }

  getAllTextBySelectors(selectors) {
    const results = [];
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const text = el.textContent.trim();
        if (text && !results.includes(text)) {
          results.push(text);
        }
      });
    }
    return results;
  }

  // Detect profile pages
  isProfilePage() {
    if (this.platform === "linkedin") {
      return (
        window.location.pathname.includes("/in/") ||
        window.location.pathname.includes("/profile/")
      );
    } else if (this.platform === "instagram") {
      return (
        window.location.pathname !== "/" &&
        !window.location.pathname.includes("/explore") &&
        !window.location.pathname.includes("/reels")
      );
    }
    return false;
  }
}

// Initialize
const scraper = new ProfileScraper();

// Notify background when a profile page loads
if (scraper.isProfilePage()) {
  setTimeout(() => {
    chrome.runtime.sendMessage({
      action: "pageLoaded",
      platform: scraper.platform,
      isProfile: true,
    });
  }, 2000);
}
