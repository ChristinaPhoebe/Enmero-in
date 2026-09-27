// The canonical service list. Enmero offers four core services.
// Each service has its own detail page under /services.
export const SERVICES = [
  {
    id: 'web-development',
    name: 'Web Development',
    headline: 'Websites and web applications built around your business',
    summary:
      'Enmero builds and improves web presence for businesses. From marketing sites to complex web platforms, we handle design, development, and deployment as a single team.',
    includes: [
      {
        title: 'Business and corporate websites',
        desc: 'Professional websites that represent your business clearly and work reliably across devices.'
      },
      {
        title: 'Web applications',
        desc: 'Custom web platforms built around specific business requirements, from internal tools to customer-facing products.'
      },
      {
        title: 'Landing pages',
        desc: 'Focused pages designed for campaigns, product launches, or lead generation.'
      },
      {
        title: 'Frontend and backend',
        desc: 'Interface development, server-side logic, databases, and API integrations handled by the same team.'
      },
      {
        title: 'Redesigns and improvements',
        desc: 'Existing websites updated for better performance, usability, or visual quality without starting from scratch.'
      },
      {
        title: 'Maintenance and support',
        desc: 'Ongoing updates, bug fixes, and performance improvements after launch.'
      }
    ],
    details: [
      'Design and development stay together, so there is no handoff between separate teams.',
      'Every project starts with understanding your business goals before writing code.',
      'Deployment, documentation, and handoff are handled as part of the engagement.'
    ]
  },
  {
    id: 'digital-transformation',
    name: 'Digital Transformation',
    headline: 'Modernize how your business operates using technology',
    summary:
      'Enmero helps businesses move from manual or disconnected processes to integrated digital systems. The goal is to make your operations more efficient, consistent, and scalable.',
    includes: [
      {
        title: 'Digitizing manual processes',
        desc: 'Paper-based or spreadsheet-heavy workflows replaced with digital systems your team can actually use.'
      },
      {
        title: 'Business workflow improvements',
        desc: 'Existing processes analyzed and redesigned to remove bottlenecks and reduce manual effort.'
      },
      {
        title: 'Internal tools',
        desc: 'Custom dashboards, admin panels, and operational tools built around how your team actually works.'
      },
      {
        title: 'Automation',
        desc: 'Repetitive tasks automated so your team spends less time on manual work and more time on what matters.'
      },
      {
        title: 'Tool integration',
        desc: 'Disconnected systems connected so data flows between them without manual copying or exporting.'
      },
      {
        title: 'Customer-facing digital experiences',
        desc: 'Portals, self-service tools, and digital touchpoints that improve how customers interact with your business.'
      }
    ],
    details: [
      'We start by understanding your current workflows before recommending changes.',
      'Solutions are practical and adopted by real teams, not just technically impressive.',
      'Implementation happens incrementally so your business keeps running during the transition.'
    ]
  },
  {
    id: 'technology-consulting',
    name: 'Technology Consulting',
    headline: 'Better technology decisions for your business',
    summary:
      'Enmero helps businesses figure out what to build, how to build it, and which technologies to use. Whether you have a clear idea or just a problem to solve, we provide the technical guidance to move forward confidently.',
    includes: [
      {
        title: 'Technology strategy',
        desc: 'High-level guidance on what technology investments make sense for your business goals and constraints.'
      },
      {
        title: 'Technical planning',
        desc: 'Detailed planning before development begins, including architecture, timelines, and milestones.'
      },
      {
        title: 'Architecture guidance',
        desc: 'Technical structure decisions made with long-term maintainability and scalability in mind.'
      },
      {
        title: 'Feasibility assessment',
        desc: 'Honest evaluation of whether an idea is technically viable and worth pursuing given your constraints.'
      },
      {
        title: 'Technical audits',
        desc: 'Review of existing systems to identify issues, risks, and opportunities for improvement.'
      },
      {
        title: 'Ongoing advisory',
        desc: 'Continued technical guidance as your product or business evolves.'
      }
    ],
    details: [
      'We give honest recommendations, even when the answer is not what you expected.',
      'Advice is grounded in practical experience, not theoretical best practices.',
      'Consulting engagements are scoped clearly, with deliverables and timelines agreed upfront.'
    ]
  },
  {
    id: 'app-development',
    name: 'App Development',
    headline: 'Mobile applications built for your business',
    summary:
      'Enmero builds mobile applications for iOS and Android. Whether you need a customer-facing app or an internal business tool, we handle design, development, and launch as a single team.',
    includes: [
      {
        title: 'Mobile applications',
        desc: 'Native or cross-platform apps chosen based on what your product actually needs.'
      },
      {
        title: 'Business apps',
        desc: 'Internal tools and operational apps that help your team work more efficiently on mobile.'
      },
      {
        title: 'Customer-facing apps',
        desc: 'Apps your customers use to interact with your business, from booking to support to purchasing.'
      },
      {
        title: 'MVP development',
        desc: 'Minimum viable products built quickly to test ideas with real users before investing further.'
      },
      {
        title: 'Backend and API integration',
        desc: 'Server-side logic, databases, and third-party integrations that power the app.'
      },
      {
        title: 'App improvements and maintenance',
        desc: 'Updates, bug fixes, and performance improvements after launch.'
      }
    ],
    details: [
      'The platform and approach are chosen around your requirements, not around a default stack.',
      'Quality is verified throughout the build, so issues are caught and resolved early.',
      'Documentation is provided so your team can work with and maintain the app after launch.'
    ]
  }
];

export const WATCHTOWER_SERVICE = {
  id: 'watchtower',
  name: 'Watchtower',
  headline: 'Long-term product management',
  summary:
    "Watchtower is Enmero's long-term management service. It keeps your product maintained, updated, and supported by the same team over a 15-month engagement with a simple monthly rate.",
  details: [
    'A fixed monthly rate across a 15-month engagement, so the cost stays predictable.',
    'Onboarding starts by reviewing your product and agreeing what will be managed.',
    'Country-specific pricing is published for your region.'
  ]
};

export const ALL_SERVICES = [...SERVICES, WATCHTOWER_SERVICE];

export const SERVICE_OPTIONS = ALL_SERVICES.map((service) => service.name);

// The contact form offers a catch-all choice alongside the real services. It is
// shared with the contact function so both sides agree on the exact wording.
export const GENERAL_ENQUIRY_OPTION = 'Something else';

export const SERVICE_CHOICES = [...SERVICE_OPTIONS, GENERAL_ENQUIRY_OPTION];

// Every service in the list above owns a page at this path. Both the navigation
// and the routes table read it from here so the two cannot drift apart.
export function servicePath(id) {
  return `/services/${id}`;
}

export function findServiceById(id) {
  return ALL_SERVICES.find((service) => service.id === id) || null;
}

export function findServiceByName(name) {
  return ALL_SERVICES.find((service) => service.name === name) || null;
}
