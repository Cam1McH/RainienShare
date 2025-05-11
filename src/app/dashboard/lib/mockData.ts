import {
    DashboardTab,
    QuickTool,
    AIModel,
    Activity,
    Event,
    Notification,
    AnalyticsDataPoint,
    SubscriptionPlan,
    PaymentMethod,
    Invoice
  } from "../types";
  
  import {
    Home,
    Brain,
    BarChart2,
    Settings,
    Users,
    Bot,
    TrendingUp,
    Sparkles,
    Shield,
    Zap,
    MessageSquare,
    User,
    CircleDollarSign
  } from "lucide-react";
  
  // Dashboard main tabs
  export const mainTabs: DashboardTab[] = [
    { name: "Home", icon: Home },
    { name: "AI Models", icon: Brain },
    { name: "Analytics", icon: BarChart2 },
    { name: "Billing", icon: CircleDollarSign },
    { name: "Settings", icon: Settings },
  ];
  
  // Quick access tools
  export const quickTools: QuickTool[] = [
    { 
      name: "Create Bot", 
      icon: Bot, 
      color: "from-purple-500 to-pink-500",
      description: "Build a custom AI assistant for your business needs" 
    },
    { 
      name: "Insights", 
      icon: TrendingUp, 
      color: "from-blue-500 to-cyan-500",
      description: "Analyze performance metrics and user feedback" 
    },
    { 
      name: "Templates", 
      icon: Sparkles, 
      color: "from-amber-400 to-orange-500",
      description: "Use pre-built solutions for common use cases" 
    },
    { 
      name: "Protection", 
      icon: Shield, 
      color: "from-emerald-500 to-green-500",
      description: "Secure your AI models and user data" 
    },
  ];
  
  // AI model status cards
  export const aiModels: AIModel[] = [
    {
      name: "CustomerGPT",
      status: "Active",
      type: "Assistant",
      interactions: 4392,
      satisfaction: 4,
      lastActive: "2 min ago",
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "AnalyticsBot",
      status: "Active",
      type: "Data Analysis",
      interactions: 1283,
      satisfaction: 88,
      lastActive: "27 min ago",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "SalesGPT",
      status: "Inactive",
      type: "Sales Assistant",
      interactions: 729,
      satisfaction: 76,
      lastActive: "3 days ago",
      color: "from-amber-400 to-orange-500",
    },
  ];
  
  // Team members - Placeholder data
  export const teamMembers = [
    { name: "Sophia Chen", role: "Product Manager", online: true, img: null },
    { name: "David Kim", role: "AI Engineer", online: true, img: null },
    { name: "Maria Rodriguez", role: "UI Designer", online: false, img: null },
    { name: "Alex Johnson", role: "Marketing", online: true, img: null },
  ];
  
  // Recent activity - Placeholder data
  export const recentActivity: Activity[] = [
    {
      title: "CustomerGPT updated",
      time: "1h ago",
      description: "New features for handling complex customer inquiries added",
      icon: Zap,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      title: "Team meeting notes",
      time: "3h ago",
      description: "Weekly AI team sync notes shared by Maria",
      icon: MessageSquare,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
    {
      title: "New team member",
      time: "Yesterday",
      description: "Welcome Alex Johnson to the marketing team",
      icon: User,
      color: "bg-gradient-to-r from-amber-400 to-orange-500",
    },
  ];
  
  // Analytics data for charts - Placeholder data
  export const weeklyData: AnalyticsDataPoint[] = [
    { day: "Mon", queries: 1420, responses: 1390 },
    { day: "Tue", queries: 1570, responses: 1530 },
    { day: "Wed", queries: 2180, responses: 2110 },
    { day: "Thu", queries: 1860, responses: 1790 },
    { day: "Fri", queries: 2390, responses: 2310 },
    { day: "Sat", queries: 1460, responses: 1400 },
    { day: "Sun", queries: 1290, responses: 1240 },
  ];
  
  // Upcoming events - Placeholder data
  export const upcomingEvents: Event[] = [
    {
      title: "AI Model Review",
      date: "Today, 3:00 PM",
      attendees: 5,
      location: "Virtual Meeting",
    },
    {
      title: "Customer Feedback Session",
      date: "Tomorrow, 11:00 AM",
      attendees: 8,
      location: "Conference Room A",
    },
    {
      title: "Q2 Strategy Planning",
      date: "May 7, 10:00 AM",
      attendees: 12,
      location: "Board Room",
    },
  ];
  
  // Dashboard notifications - Placeholder data
  export const notifications: Notification[] = [
    {
      title: "System Update",
      description: "New AI features are now available in your account",
      time: "2 hours ago",
      read: false,
      type: "update",
    },
    {
      title: "Usage Alert",
      description: "You've reached 85% of your monthly query limit",
      time: "Yesterday",
      read: true,
      type: "alert",
    },
    {
      title: "New Integration",
      description: "Salesforce integration is now available for your AI bots",
      time: "3 days ago",
      read: true,
      type: "feature",
    },
  ];
  
  // Subscription plans
  export const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$29',
      period: 'per month',
      description: 'Perfect for small websites with basic AI needs',
      features: [
        '1 AI module',
        '10,000 queries/month',
        'Standard support',
        'Basic customization'
      ],
      popular: false,
      current: true
    },
    {
      id: 'business',
      name: 'Business',
      price: '$99',
      period: 'per month',
      description: 'For growing businesses with multiple AI needs',
      features: [
        '5 AI modules',
        '100,000 queries/month',
        'Priority support',
        'Advanced customization',
        'Analytics dashboard',
        'API access'
      ],
      popular: true,
      current: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large businesses with specialized requirements',
      features: [
        'Unlimited AI modules',
        'Custom query volume',
        'Dedicated support',
        'Complete customization',
        'Advanced analytics',
        'Custom AI models',
        'SLA guarantee'
      ],
      popular: false,
      current: false
    }
  ];
  
  // Payment methods
  export const paymentMethods: PaymentMethod[] = [
    {
      id: 'card_1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expMonth: 12,
      expYear: 2025,
      isDefault: true
    }
  ];
  
  // Invoices
  export const invoices: Invoice[] = [
    {
      id: 'inv_123456',
      date: 'May 1, 2025',
      amount: '$29.00',
      status: 'paid'
    },
    {
      id: 'inv_123455',
      date: 'Apr 1, 2025',
      amount: '$29.00',
      status: 'paid'
    },
    {
      id: 'inv_123454',
      date: 'Mar 1, 2025',
      amount: '$29.00',
      status: 'paid'
    }
  ];