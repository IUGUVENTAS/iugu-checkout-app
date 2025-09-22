/**
 * SISTEMA DE TRACKING PROFISSIONAL
 * Google Analytics 4 + Facebook Pixel
 * TopiTop Peru - Checkout Tracking
 */

class CheckoutTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.currentStep = 1;
    this.checkoutData = {};
    this.startTime = Date.now();
    this.init();
  }

  // === INICIALIZAÇÃO === //
  init() {
    this.setupEventQueue();
    this.setupEventListeners();
    this.trackPageView();
    
    // Track engajamento a cada 30 segundos
    this.engagementInterval = setInterval(() => {
      this.trackEngagementTime();
    }, 30000);
    
    console.log('🎯 CheckoutTracker inicializado:', {
      sessionId: this.sessionId,
      userId: this.userId
    });
  }

  // === MÉTODOS AUXILIARES === //
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getUserId() {
    let userId = localStorage.getItem('checkout_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('checkout_user_id', userId);
    }
    return userId;
  }

  // === MÉTODOS DE TRACKING === //

  // Google Analytics 4
  trackGA4(eventName, parameters = {}) {
    if (typeof gtag === 'undefined') {
      console.warn('🛑 Google Analytics não carregado. Evento ignorado:', eventName);
      return;
    }

    const enrichedParams = {
      ...parameters,
      session_id: this.sessionId,
      user_id: this.userId,
      checkout_step: this.currentStep,
      timestamp: new Date().toISOString()
    };

    console.log('📊 GA4 Event:', eventName, enrichedParams);
    gtag('event', eventName, enrichedParams);
  }

  // Facebook Pixel
  trackFB(eventName, parameters = {}) {
    if (typeof fbq === 'undefined') {
      console.warn('🛑 Facebook Pixel não carregado. Evento ignorado:', eventName);
      return;
    }

    const enrichedParams = {
      ...parameters,
      session_id: this.sessionId,
      checkout_step: this.currentStep
    };

    console.log('📘 FB Event:', eventName, enrichedParams);
    fbq('track', eventName, enrichedParams);
  }

  // === EVENTOS ESPECÍFICOS === //

  // Visualização da página
  trackPageView() {
    this.trackGA4('page_view', {
      page_title: document.title,
      page_location: window.location.href
    });
  }

  // Início do checkout
  trackCheckoutStart(productData = {}) {
    this.currentStep = 1;
    this.checkoutData = { ...productData };
    
    this.trackGA4('begin_checkout', {
      currency: 'PEN',
      value: productData.price || 0,
      items: [{
        item_id: productData.id || 'unknown',
        item_name: productData.name || 'Produto',
        category: productData.category || 'Clothing',
        quantity: productData.quantity || 1,
        price: productData.price || 0
      }]
    });

    this.trackFB('InitiateCheckout', {
      content_type: 'product',
      currency: 'PEN',
      value: productData.price || 0,
      contents: [{
        id: productData.id || 'unknown',
        quantity: productData.quantity || 1
      }]
    });
  }

  // Progresso entre steps
  trackStepProgress(step, stepName = '') {
    this.currentStep = step;
    
    this.trackGA4('checkout_progress', {
      checkout_step: step,
      step_name: stepName || `Step ${step}`,
      step_label: stepName
    });

    this.trackFB('Custom', {
      event_name: 'CheckoutProgress',
      checkout_step: step,
      step_name: stepName
    });
  }

  // Progresso do formulário
  trackFormProgress(formType, fieldName, isComplete = false) {
    this.trackGA4('form_progress', {
      form_type: formType,
      field_name: fieldName,
      is_complete: isComplete,
      completion_status: isComplete ? 'completed' : 'started'
    });
  }

  // Seleção de método de pagamento
  trackPaymentMethodSelect(method) {
    this.trackGA4('select_payment_method', {
      payment_method: method,
      checkout_step: this.currentStep
    });

    this.trackFB('Custom', {
      event_name: 'PaymentMethodSelected',
      payment_method: method
    });
  }

  // Erro de validação
  trackValidationError(formType, fieldName, errorType) {
    this.trackGA4('form_validation_error', {
      form_type: formType,
      field_name: fieldName,
      error_type: errorType
    });
  }

  // Compra finalizada
  trackPurchase(orderData) {
    this.trackGA4('purchase', {
      transaction_id: orderData.orderId,
      value: orderData.total,
      currency: 'PEN',
      items: orderData.items || []
    });

    this.trackFB('Purchase', {
      content_type: 'product',
      currency: 'PEN',
      value: orderData.total,
      contents: orderData.items || []
    });
  }

  // === EVENTOS DE ECOMMERCE AVANÇADOS === //

  // Visualização de produto
  trackViewItem(productData) {
    this.trackGA4('view_item', {
      currency: 'PEN',
      value: productData.price || 0,
      items: [{
        item_id: productData.id,
        item_name: productData.name,
        item_category: productData.category || 'Clothing',
        item_brand: 'TopiTop',
        price: productData.price || 0,
        quantity: 1
      }]
    });

    this.trackFB('ViewContent', {
      content_type: 'product',
      content_ids: [productData.id],
      content_name: productData.name,
      currency: 'PEN',
      value: productData.price || 0
    });
  }

  // Adicionar ao carrinho
  trackAddToCart(productData) {
    this.trackGA4('add_to_cart', {
      currency: 'PEN',
      value: productData.price * (productData.quantity || 1),
      items: [{
        item_id: productData.id,
        item_name: productData.name,
        item_category: productData.category || 'Clothing',
        item_brand: 'TopiTop',
        price: productData.price,
        quantity: productData.quantity || 1
      }]
    });

    this.trackFB('AddToCart', {
      content_type: 'product',
      content_ids: [productData.id],
      content_name: productData.name,
      currency: 'PEN',
      value: productData.price * (productData.quantity || 1),
      contents: [{
        id: productData.id,
        quantity: productData.quantity || 1
      }]
    });
  }

  // Remover do carrinho
  trackRemoveFromCart(productData) {
    this.trackGA4('remove_from_cart', {
      currency: 'PEN',
      value: productData.price * (productData.quantity || 1),
      items: [{
        item_id: productData.id,
        item_name: productData.name,
        item_category: productData.category || 'Clothing',
        item_brand: 'TopiTop',
        price: productData.price,
        quantity: productData.quantity || 1
      }]
    });

    this.trackFB('Custom', {
      event_name: 'RemoveFromCart',
      content_type: 'product',
      content_ids: [productData.id],
      content_name: productData.name,
      currency: 'PEN',
      value: productData.price * (productData.quantity || 1)
    });
  }

  // Visualizar carrinho
  trackViewCart(cartData) {
    this.trackGA4('view_cart', {
      currency: 'PEN',
      value: cartData.total || 0,
      items: cartData.items || []
    });

    this.trackFB('Custom', {
      event_name: 'ViewCart',
      content_type: 'product',
      currency: 'PEN',
      value: cartData.total || 0,
      num_items: cartData.items?.length || 0
    });
  }

  // Adicionar informações de pagamento
  trackAddPaymentInfo(paymentMethod, value) {
    this.trackGA4('add_payment_info', {
      currency: 'PEN',
      value: value || 0,
      payment_type: paymentMethod,
      checkout_step: this.currentStep
    });

    this.trackFB('AddPaymentInfo', {
      content_type: 'product',
      currency: 'PEN',
      value: value || 0,
      payment_method: paymentMethod
    });
  }

  // Adicionar informações de envio
  trackAddShippingInfo(shippingMethod, value) {
    this.trackGA4('add_shipping_info', {
      currency: 'PEN',
      value: value || 0,
      shipping_tier: shippingMethod,
      checkout_step: this.currentStep
    });

    this.trackFB('Custom', {
      event_name: 'AddShippingInfo',
      content_type: 'product',
      currency: 'PEN',
      value: value || 0,
      shipping_method: shippingMethod
    });
  }

  // Aplicar cupom
  trackApplyCoupon(couponCode, discount) {
    this.trackGA4('coupon_applied', {
      coupon: couponCode,
      discount: discount || 0,
      currency: 'PEN',
      checkout_step: this.currentStep
    });

    this.trackFB('Custom', {
      event_name: 'CouponApplied',
      coupon_code: couponCode,
      discount_value: discount || 0,
      currency: 'PEN'
    });
  }

  // Busca
  trackSearch(searchTerm, resultCount = 0) {
    this.trackGA4('search', {
      search_term: searchTerm,
      results_count: resultCount
    });

    this.trackFB('Search', {
      content_type: 'product',
      search_string: searchTerm
    });
  }

  // === EVENTOS DE INTERAÇÃO === //

  // Clique em botão
  trackButtonClick(buttonName, context = '') {
    this.trackGA4('button_click', {
      button_name: buttonName,
      click_context: context,
      checkout_step: this.currentStep
    });
  }

  // Foco em input
  trackInputFocus(inputName, stepName = '') {
    this.trackGA4('input_focus', {
      input_name: inputName,
      step_name: stepName,
      checkout_step: this.currentStep
    });
  }

  // Saída do checkout
  trackCheckoutExit(exitPoint) {
    this.trackGA4('checkout_exit', {
      exit_point: exitPoint,
      checkout_step: this.currentStep,
      time_spent: Date.now() - this.startTime
    });
  }

  // === CONFIGURAÇÃO DE LISTENERS === //
  setupEventListeners() {
    // Listener para saída da página
    window.addEventListener('beforeunload', () => {
      this.trackCheckoutExit('page_unload');
    });

    // Listener para visibilidade da página
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackGA4('page_visibility_change', {
          visibility_state: 'hidden'
        });
      } else {
        this.trackGA4('page_visibility_change', {
          visibility_state: 'visible'
        });
      }
    });

    // Listener para erros JavaScript
    window.addEventListener('error', (event) => {
      this.trackGA4('javascript_error', {
        error_message: event.message,
        error_filename: event.filename,
        error_lineno: event.lineno,
        checkout_step: this.currentStep
      });
    });

    // === TRACKING DE PERFORMANCE === //
    this.setupPerformanceTracking();
    
    // === SCROLL DEPTH TRACKING === //
    this.setupScrollTracking();
  }

  // === SISTEMA DE QUEUE E PERFORMANCE === //
  
  // Queue para eventos offline
  setupEventQueue() {
    if (!this.eventQueue) {
      this.eventQueue = [];
    }
    
    // Processar queue quando GA4/FB carregarem
    const processQueue = () => {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        if (event.platform === 'ga4' && typeof gtag !== 'undefined') {
          gtag('event', event.name, event.params);
        } else if (event.platform === 'fb' && typeof fbq !== 'undefined') {
          fbq('track', event.name, event.params);
        } else {
          this.eventQueue.unshift(event); // Colocar de volta na queue
          break;
        }
      }
    };

    // Verificar periodicamente se GA4/FB carregaram
    const checkInterval = setInterval(() => {
      if (typeof gtag !== 'undefined' && typeof fbq !== 'undefined') {
        processQueue();
        clearInterval(checkInterval);
      }
    }, 100);
  }

  // Performance tracking
  setupPerformanceTracking() {
    // Core Web Vitals
    if ('web-vital' in window || 'PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            this.trackGA4('web_vital_lcp', {
              value: Math.round(entry.startTime),
              metric_name: 'LCP',
              checkout_step: this.currentStep
            });
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            this.trackGA4('web_vital_fid', {
              value: Math.round(entry.processingStart - entry.startTime),
              metric_name: 'FID',
              checkout_step: this.currentStep
            });
          }
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          this.trackGA4('web_vital_cls', {
            value: Math.round(clsValue * 1000),
            metric_name: 'CLS',
            checkout_step: this.currentStep
          });
        }).observe({ entryTypes: ['layout-shift'] });

      } catch (e) {
        console.warn('⚠️ Performance Observer não suportado');
      }
    }

    // Page Load Time
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.trackGA4('page_load_time', {
            value: Math.round(navigation.loadEventEnd - navigation.fetchStart),
            dom_content_loaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
            checkout_step: this.currentStep
          });
        }
      }, 0);
    });
  }

  // Scroll depth tracking
  setupScrollTracking() {
    const scrollDepths = [25, 50, 75, 100];
    const triggeredDepths = new Set();
    
    const trackScrollDepth = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      scrollDepths.forEach(depth => {
        if (scrollPercent >= depth && !triggeredDepths.has(depth)) {
          triggeredDepths.add(depth);
          this.trackGA4('scroll_depth', {
            scroll_depth: depth,
            checkout_step: this.currentStep
          });
          
          this.trackFB('Custom', {
            event_name: 'ScrollDepth',
            scroll_depth: depth
          });
        }
      });
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          trackScrollDepth();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // === CONVERSÕES CUSTOMIZADAS === //
  
  // Lead generation
  trackLead(leadData) {
    this.trackGA4('generate_lead', {
      currency: 'PEN',
      value: leadData.value || 0,
      lead_type: leadData.type || 'checkout_form'
    });

    this.trackFB('Lead', {
      content_name: leadData.source || 'checkout',
      currency: 'PEN',
      value: leadData.value || 0
    });
  }

  // Sign up
  trackSignUp(method = 'email') {
    this.trackGA4('sign_up', {
      method: method
    });

    this.trackFB('CompleteRegistration', {
      content_name: 'checkout_signup'
    });
  }

  // Timer de engajamento
  trackEngagementTime() {
    const engagementTime = Date.now() - this.startTime;
    
    if (engagementTime > 10000) { // Mais de 10 segundos
      this.trackGA4('user_engagement', {
        engagement_time_msec: engagementTime,
        checkout_step: this.currentStep
      });
    }
  }

  // === MÉTODOS PÚBLICOS === //

  // Iniciar novo step
  startStep(stepNumber) {
    this.currentStep = stepNumber;
    this.trackStepProgress(stepNumber, this.getStepName(stepNumber));
  }

  // Obter nome do step
  getStepName(stepNumber) {
    const stepNames = {
      1: 'Datos Personales',
      2: 'Dirección de Entrega',
      3: 'Método de Pago'
    };
    return stepNames[stepNumber] || `Step ${stepNumber}`;
  }

  // Obter contexto atual
  getCurrentContext() {
    return `step_${this.currentStep}`;
  }
}

// === INICIALIZAÇÃO AUTOMÁTICA === //
document.addEventListener('DOMContentLoaded', () => {
  // Só inicializa se não existir uma instância
  if (!window.checkoutTracker) {
    window.checkoutTracker = new CheckoutTracker();
  }

  // Observer para mudanças de steps
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const element = mutation.target;
        if (element.id && element.id.includes('step') && element.classList.contains('active')) {
          const stepNumber = parseInt(element.id.replace('step', '').replace('-content', ''));
          if (!isNaN(stepNumber) && window.checkoutTracker) {
            window.checkoutTracker.startStep(stepNumber);
          }
        }
      }
    });
  });

  // Observar mudanças nos elementos de step
  const stepElements = document.querySelectorAll('[id^="step"]');
  stepElements.forEach(el => {
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
  });
});

// === FUNÇÕES DE CONVENIÊNCIA GLOBAIS PROFISSIONAIS === //

// Wrapper seguro para tracking
window.trackEvent = (eventName, parameters = {}) => {
  try {
    if (window.checkoutTracker) {
      window.checkoutTracker.trackGA4(eventName, parameters);
      window.checkoutTracker.trackFB('Custom', { event_name: eventName, ...parameters });
    }
  } catch (error) {
    console.error('Erro no tracking:', error);
  }
};

// Tracking de produtos
window.trackProduct = {
  view: (productData) => window.checkoutTracker?.trackViewItem(productData),
  addToCart: (productData) => window.checkoutTracker?.trackAddToCart(productData),
  removeFromCart: (productData) => window.checkoutTracker?.trackRemoveFromCart(productData)
};

// Tracking de checkout
window.trackCheckout = {
  start: (productData) => window.checkoutTracker?.trackCheckoutStart(productData),
  step: (step, stepName) => window.checkoutTracker?.trackStepProgress(step, stepName),
  payment: (method, value) => window.checkoutTracker?.trackAddPaymentInfo(method, value),
  shipping: (method, value) => window.checkoutTracker?.trackAddShippingInfo(method, value),
  purchase: (orderData) => window.checkoutTracker?.trackPurchase(orderData)
};

// Tracking de interações
window.trackInteraction = {
  button: (buttonName, context) => window.checkoutTracker?.trackButtonClick(buttonName, context),
  form: (formType, fieldName, isComplete) => window.checkoutTracker?.trackFormProgress(formType, fieldName, isComplete),
  error: (formType, fieldName, errorType) => window.checkoutTracker?.trackValidationError(formType, fieldName, errorType),
  search: (term, results) => window.checkoutTracker?.trackSearch(term, results)
};

// Tracking de conversões
window.trackConversion = {
  lead: (leadData) => window.checkoutTracker?.trackLead(leadData),
  signup: (method) => window.checkoutTracker?.trackSignUp(method),
  coupon: (code, discount) => window.checkoutTracker?.trackApplyCoupon(code, discount)
};

// Debug mode
window.debugTracking = (enable = true) => {
  if (window.checkoutTracker) {
    window.checkoutTracker.debugMode = enable;
    console.log(enable ? '🐛 Debug de tracking ativado' : '✅ Debug de tracking desativado');
  }
};

// Health check
window.trackingHealthCheck = () => {
  const health = {
    ga4_loaded: typeof gtag !== 'undefined',
    fb_loaded: typeof fbq !== 'undefined',
    tracker_initialized: !!window.checkoutTracker,
    current_step: window.checkoutTracker?.currentStep || 'unknown',
    session_id: window.checkoutTracker?.sessionId || 'unknown'
  };
  
  console.log('🏥 Tracking Health Check:', health);
  return health;
};

console.log('🚀 Sistema de Tracking TopiTop Peru carregado com sucesso!');
