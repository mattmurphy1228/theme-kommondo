((() => {
  'use strict';
  class e extends HTMLElement {
    constructor() {
      (super(),
        (this.searchInputElem = null),
        (this.form = null),
        (this.boundHandleSearchInputChange =
          this.handleSearchInputChange.bind(this)),
        (this.boundHandleShowAllSearchResults =
          this.handleShowAllSearchResults.bind(this)));
    }
    connectedCallback() {
      (this.cacheElements(), this.attachEventListeners());
    }
    disconnectedCallback() {
      this.detachEventListeners();
    }
    cacheElements() {
      ((this.searchInputElem = this.querySelector(
        '.js-search-box__input .js-input__field',
      )),
        (this.form = this.querySelector('.js-search-box')));
    }
    attachEventListeners() {
      (this.searchInputElem &&
        this.searchInputElem.addEventListener(
          'input',
          ((e, t) => {
            let s;
            return (...n) => {
              (clearTimeout(s), (s = setTimeout(() => e.apply(void 0, n), t)));
            };
          })(this.boundHandleSearchInputChange, 300),
        ),
        document.body.addEventListener(
          'show-all-search-results',
          this.boundHandleShowAllSearchResults,
        ));
    }
    detachEventListeners() {
      (this.searchInputElem &&
        this.searchInputElem.removeEventListener(
          'input',
          this.boundHandleSearchInputChange,
        ),
        document.body.removeEventListener(
          'show-all-search-results',
          this.boundHandleShowAllSearchResults,
        ));
    }
    handleSearchInputChange() {
      const e = this.searchInputElem.value.trim();
      this.searchFunction(e);
    }
    searchFunction(e) {
      document.body.dispatchEvent(
        new CustomEvent('predictive-search', {
          bubbles: !0,
          detail: { searchTerm: e, source: 'search-box' },
        }),
      );
    }
    handleShowAllSearchResults() {
      this.form && this.form.submit();
    }
  }
  customElements.get('search-box') || customElements.define('search-box', e);
})(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.cartIconButton = null),
          (this.cartIconCountBadge = null),
          (this.hamburgerButton = null),
          (this.cartIconButtonAriaLabel = null),
          (this.emptyCartIconButtonAriaLabel = null),
          (this.boundCartIconButtonClick = this.cartIconButtonClick.bind(this)),
          (this.boundHamburgerButtonClick =
            this.hamburgerButtonClick.bind(this)),
          (this.boundMainMenuClose = this.mainMenuClose.bind(this)),
          (this.boundCartItemCountChange =
            this.cartItemCountChange.bind(this)));
      }
      connectedCallback() {
        (this.cacheElements(),
          this.attachEventListeners(),
          (this.cartIconButtonAriaLabel =
            this.dataset.cartIconButtonAriaLabel ?? ''),
          (this.emptyCartIconButtonAriaLabel =
            this.dataset.emptyCartIconButtonAriaLabel ?? ''));
      }
      disconnectedCallback() {
        this.detachEventListeners();
      }
      cacheElements() {
        ((this.cartIconButton = this.querySelector('.js-cart-icon')),
          (this.cartIconCountBadge = this.querySelector(
            '.js-cart-icon__count-badge',
          )),
          (this.hamburgerButton = this.querySelector(
            '.js-header-icons__icon--hamburger',
          )));
      }
      attachEventListeners() {
        (document.body.addEventListener(
          'main-menu-close',
          this.boundMainMenuClose,
        ),
          document.body.addEventListener(
            'cart-item-count-change',
            this.boundCartItemCountChange,
          ),
          this.cartIconButton &&
            this.cartIconButton.addEventListener(
              'click',
              this.boundCartIconButtonClick,
            ),
          this.hamburgerButton &&
            this.hamburgerButton.addEventListener(
              'click',
              this.boundHamburgerButtonClick,
            ));
      }
      detachEventListeners() {
        (document.body.removeEventListener(
          'main-menu-close',
          this.boundMainMenuClose,
        ),
          document.body.removeEventListener(
            'cart-item-count-change',
            this.boundCartItemCountChange,
          ),
          this.cartIconButton &&
            this.cartIconButton.removeEventListener(
              'click',
              this.boundCartIconButtonClick,
            ),
          this.hamburgerButton &&
            this.hamburgerButton.removeEventListener(
              'click',
              this.boundHamburgerButtonClick,
            ));
      }
      cartIconButtonClick() {
        if (this.cartIconButton) {
          try {
            document.body.dispatchEvent(
              new CustomEvent('cart-open', {
                bubbles: !0,
                detail: { source: 'header-icon-list' },
              }),
            );
          } catch (e) {}
          this.cartIconButton.setAttribute('aria-expanded', 'true');
        }
      }
      hamburgerButtonClick() {
        if (this.hamburgerButton) {
          try {
            document.body.dispatchEvent(
              new CustomEvent('main-menu-open', {
                bubbles: !0,
                detail: { source: 'header-icon-list' },
              }),
            );
          } catch (e) {}
          (this.hamburgerButton.setAttribute('aria-expanded', 'true'),
            this.hamburgerButton.setAttribute('aria-label', 'Close menu'));
        }
      }
      mainMenuClose() {
        this.hamburgerButton &&
          (this.hamburgerButton.setAttribute('aria-expanded', 'false'),
          this.hamburgerButton.setAttribute('aria-label', 'Open menu'));
      }
      cartItemCountChange(e) {
        if (!this.cartIconButton || !this.cartIconCountBadge) return;
        const { count: t } = e.detail,
          s =
            0 === t
              ? this.emptyCartIconButtonAriaLabel
              : String(this.cartIconButtonAriaLabel).replace('{{ count }}', t);
        (this.cartIconButton.setAttribute('aria-label', s),
          (this.cartIconCountBadge.innerText = t >= 100 ? '99+' : t),
          this.cartIconCountBadge.classList.toggle(
            'cart-icon__count-badge--hidden',
            0 === t,
          ));
      }
    }
    customElements.get('header-icon-list') ||
      customElements.define('header-icon-list', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.predictiveSearchResults = null),
          (this.showAllButton = []),
          (this.overlay = null),
          (this.abortController = new AbortController()),
          (this.boundHandlePredictiveSearch =
            this.handlePredictiveSearch.bind(this)),
          (this.boundHandleShowAllButtonClick =
            this.handleShowAllButtonClick.bind(this)),
          (this.boundOverlayClick = this.overlayClick.bind(this)));
      }
      connectedCallback() {
        (this.cacheElements(), this.attachEventListeners());
      }
      disconnectedCallback() {
        this.detachEventListeners();
        try {
          window.bodyScrollLock && window.bodyScrollLock.enableBodyScroll(this);
        } catch (e) {}
      }
      cacheElements() {
        ((this.predictiveSearchResults = this.querySelector(
          '[data-predictive-search-results]',
        )),
          (this.showAllButtons = Array.from(
            this.querySelectorAll('.js-search-product-box__show-all-btn'),
          )),
          (this.overlay = this.querySelector(
            '.js-predictive-search__overlay',
          )));
      }
      attachEventListeners() {
        (document.body.addEventListener(
          'predictive-search',
          this.boundHandlePredictiveSearch,
        ),
          this.attachButtonEventListener(),
          this.overlay &&
            this.overlay.addEventListener('click', this.boundOverlayClick));
      }
      attachButtonEventListener() {
        this.showAllButtons &&
          this.showAllButtons.length > 0 &&
          this.showAllButtons.forEach((e) => {
            e.addEventListener('click', this.boundHandleShowAllButtonClick);
          });
      }
      detachEventListeners() {
        (document.body.removeEventListener(
          'predictive-search',
          this.boundHandlePredictiveSearch,
        ),
          this.detachButtonEventListener(),
          this.overlay &&
            this.overlay.removeEventListener('click', this.boundOverlayClick));
      }
      detachButtonEventListener() {
        this.showAllButtons &&
          this.showAllButtons.length > 0 &&
          this.showAllButtons.forEach((e) => {
            e.removeEventListener('click', this.boundHandleShowAllButtonClick);
          });
      }
      handlePredictiveSearch(e) {
        const { searchTerm: t } = e.detail;
        if (!t) return void this.closeSearchResultsPanel();
        const s = parseInt(window.theme.settings.suggestionsResultsLimit, 10);
        let n = '';
        ((n += window.theme.settings.suggestArticles ? 'article' : ''),
          (n += window.theme.settings.suggestCollections ? ',collection' : ''),
          (n += window.theme.settings.suggestProducts ? ',product' : ''),
          (n += window.theme.settings.suggestPages ? ',page' : ''),
          fetch(
            `${window.routes.predictiveSearchUrl}?q=${encodeURIComponent(t)}&resources[type]=${n}&resources[options][fields]=title,variants.sku,product_type,variants.title&resources[limit]=${s}&section_id=predictive-search`,
            { signal: this.abortController.signal },
          )
            .then((e) => {
              if (!e.ok)
                throw (this.closeSearchResultsPanel(), new Error(e.status));
              return e.text();
            })
            .then((e) => {
              const t = new DOMParser()
                .parseFromString(e, 'text/html')
                .querySelector('#shopify-section-predictive-search').innerHTML;
              this.renderSearchResults(t);
            })
            .catch((e) => {
              throw (
                'AbortError' !== e.name && this.closeSearchResultsPanel(),
                this.closeSearchResultsPanel(),
                e
              );
            }));
      }
      renderSearchResults(e) {
        (this.predictiveSearchResults &&
          (this.predictiveSearchResults.innerHTML = e),
          this.openSearchResultsPanel(),
          setTimeout(() => {
            ((this.showAllButtons = Array.from(
              this.querySelectorAll('.js-search-product-box__show-all-btn'),
            )),
              this.detachButtonEventListener(),
              this.attachButtonEventListener());
          }, 500));
      }
      openSearchResultsPanel() {
        if (
          (this.predictiveSearchResults &&
            this.predictiveSearchResults.classList.remove(
              'search__suggestion-results--hidden',
            ),
          !(window.innerWidth < 1024))
        ) {
          this.overlay &&
            this.overlay.classList.remove('predictive-search__overlay--hidden');
          try {
            window.bodyScrollLock &&
              window.bodyScrollLock.disableBodyScroll(this);
          } catch (e) {}
        }
      }
      closeSearchResultsPanel() {
        if (
          (this.predictiveSearchResults &&
            this.predictiveSearchResults.classList.add(
              'search__suggestion-results--hidden',
            ),
          !(window.innerWidth < 1024))
        ) {
          this.overlay &&
            this.overlay.classList.add('predictive-search__overlay--hidden');
          try {
            window.bodyScrollLock &&
              window.bodyScrollLock.enableBodyScroll(this);
          } catch (e) {}
        }
      }
      handleShowAllButtonClick() {
        document.body.dispatchEvent(
          new CustomEvent('show-all-search-results', {
            bubbles: !0,
            detail: { source: 'predictive-search' },
          }),
        );
      }
      overlayClick() {
        this.closeSearchResultsPanel();
      }
    }
    customElements.get('predictive-search') ||
      customElements.define('predictive-search', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.btn = null),
          (this.menu = null),
          (this.dropdownItems = []),
          (this.boundBtnClick = this.btnClick.bind(this)),
          (this.boundCloseDropdown = this.closeDropdown.bind(this)),
          (this.boundCartDrawerOpenHandler =
            this.cartDrawerOpenHandler.bind(this)));
      }
      connectedCallback() {
        this.addEventListeners();
      }
      addEventListeners() {
        (document.body.addEventListener(
          'mega-menu-open',
          this.boundCloseDropdown,
        ),
          document.body.addEventListener(
            'cart-open',
            this.boundCartDrawerOpenHandler,
          ),
          (this.btn = this.querySelector('.js-sort-dropdown__button')),
          this.btn &&
            (this.btn.addEventListener('click', this.boundBtnClick),
            (this.menu = this.querySelector('.js-sort-dropdown__menu')),
            this.menu &&
              (this.dropdownItems = Array.from(
                this.menu.querySelectorAll('.js-sort-dropdown__label'),
              ))));
      }
      disconnectedCallback() {
        (document.body.removeEventListener(
          'mega-menu-open',
          this.boundCloseDropdown,
        ),
          document.body.removeEventListener(
            'cart-open',
            this.boundCartDrawerOpenHandler,
          ),
          this.btn &&
            this.btn.removeEventListener('click', this.boundBtnClick));
      }
      btnClick(e) {
        (e.stopPropagation(), this.toggleDropdown());
      }
      toggleDropdown() {
        if (!this.menu) return;
        const e = 'true' === this.btn.getAttribute('aria-expanded');
        if (
          (this.btn.hasAttribute('aria-controls') ||
            (this.btn.setAttribute('aria-controls', this.menu.id),
            this.btn.setAttribute('aria-haspopup', 'true'),
            this.menu.setAttribute('role', 'listbox')),
          this.btn.setAttribute('aria-expanded', !e),
          this.menu.classList.toggle('sort-dropdown__menu--hidden', e),
          !e)
        ) {
          document.body.dispatchEvent(
            new CustomEvent('sort-dropdown-open', {
              bubbles: !0,
              detail: { source: 'sort-dropdown' },
            }),
          );
          const e = this.menu.querySelector('.js-sort-dropdown__label');
          e && e.focus();
        }
      }
      closeDropdown() {
        this.closeSortDropdown();
      }
      cartDrawerOpenHandler() {
        this.closeSortDropdown();
      }
      closeSortDropdown() {
        this.menu &&
          (this.btn.setAttribute('aria-expanded', !1),
          this.menu.classList.toggle('sort-dropdown__menu--hidden', !0));
      }
    }
    customElements.get('sort-dropdown') ||
      customElements.define('sort-dropdown', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.mobileMenuBodyElement = null),
          (this.mobileMenuCloseElement = null),
          (this.mobileMenuNavs = []),
          (this.mobileMenuToggleCheckboxes = []),
          (this.boundMenuToggleCheckboxChange =
            this.menuToggleCheckboxChange.bind(this)),
          (this.boundMenuCloseClick = this.menuCloseClick.bind(this)),
          (this.boundHandleOpen = this.handleOpen.bind(this)));
      }
      connectedCallback() {
        (this.cacheElements(), this.attachEventListeners());
      }
      disconnectedCallback() {
        (document.body.removeEventListener(
          'main-menu-open',
          this.boundHandleOpen,
        ),
          this.mobileMenuCloseElement &&
            this.mobileMenuCloseElement.removeEventListener(
              'click',
              this.boundMenuCloseClick,
            ),
          this.mobileMenuToggleCheckboxes.forEach((e) => {
            e.removeEventListener('change', this.boundMenuToggleCheckboxChange);
          }),
          this.closeAllMobileMenuNavs());
      }
      cacheElements() {
        ((this.mobileMenuBodyElement = this.querySelector('.js-mobile-menu')),
          (this.mobileMenuCloseElement = this.querySelector(
            '.js-mobile-menu__close',
          )),
          (this.mobileMenuNavs = Array.from(
            this.querySelectorAll('.js-mobile-menu__nav'),
          )),
          (this.mobileMenuToggleCheckboxes = Array.from(
            this.querySelectorAll('.js-mobile-menu__toggle'),
          )),
          (this.mobileMenuToggleCheckboxes =
            this.mobileMenuToggleCheckboxes.map((e) =>
              e.querySelector('.js-checkbox__input'),
            )));
      }
      attachEventListeners() {
        (document.body.addEventListener('main-menu-open', this.boundHandleOpen),
          this.mobileMenuCloseElement &&
            this.mobileMenuCloseElement.addEventListener(
              'click',
              this.boundMenuCloseClick,
            ),
          this.mobileMenuToggleCheckboxes.forEach((e) => {
            e.addEventListener('change', this.boundMenuToggleCheckboxChange);
          }));
      }
      menuToggleCheckboxChange(e) {
        const t = e.currentTarget,
          s = t.closest('.checkbox');
        if (!s) return;
        const n = s.parentElement;
        n && this.toggleMobileMenuNav(t.checked, n);
      }
      toggleMobileMenuNav(e, t) {
        const s = t.nextElementSibling;
        if (s) {
          e
            ? s.classList.add('mobile-menu__nav--opened')
            : s.classList.remove('mobile-menu__nav--opened');
          try {
            window.bodyScrollLock &&
              this.mobileMenuBodyElement &&
              window.bodyScrollLock.disableBodyScroll(
                this.mobileMenuBodyElement,
              );
          } catch (e) {}
        }
      }
      menuCloseClick(e) {
        (e.preventDefault(), this.closeAllMobileMenuNavs());
      }
      closeAllMobileMenuNavs() {
        (this.mobileMenuNavs.forEach((e) => {
          e.classList.remove('mobile-menu__nav--opened');
        }),
          this.mobileMenuToggleCheckboxes.forEach((e) => {
            e.checked = !1;
          }));
        try {
          window.bodyScrollLock &&
            this.mobileMenuBodyElement &&
            window.bodyScrollLock.enableBodyScroll(this.mobileMenuBodyElement);
        } catch (e) {}
        try {
          document.body.dispatchEvent(
            new CustomEvent('main-menu-close', {
              bubbles: !0,
              detail: { source: 'mobile-menu' },
            }),
          );
        } catch (e) {}
      }
      handleOpen() {
        const e = this.querySelector('.js-mobile-menu__nav-1');
        if (e) {
          e.classList.add('mobile-menu__nav--opened');
          try {
            window.bodyScrollLock &&
              this.mobileMenuBodyElement &&
              window.bodyScrollLock.disableBodyScroll(
                this.mobileMenuBodyElement,
              );
          } catch (e) {}
        }
      }
    }
    customElements.get('mobile-menu') ||
      customElements.define('mobile-menu', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.mainMenuDesktop = null),
          (this.megaMenuWrapper = null),
          (this.megaMenus = []),
          (this.overlay = null),
          (this.menuItems = []),
          (this.boundOverlayMouseOver = this.overlayMouseOver.bind(this)),
          (this.boundMainMenuDesktopMouseOver = (e) => {
            const { target: t } = e;
            t.classList.contains('js-mega-menu-item__link') ||
              t.classList.contains('js-mega-menu-item__title') ||
              t.classList.contains('js-mega-menu-item__sub-menu-title') ||
              t.classList.contains('js-mega-menu-item__sub-menu-link') ||
              t.classList.contains('js-mega-menu-item__image') ||
              (e.preventDefault(), e.stopPropagation());
          }),
          (this.boundSecondaryMenuDropdownClick =
            this.secondaryMenuDropdownClick.bind(this)),
          (this.boundCartDrawerOpenHandler =
            this.cartDrawerOpenHandler.bind(this)),
          (this.boundDocumentMouseMove = this.documentMouseMove.bind(this)));
      }
      connectedCallback() {
        (this.cacheElements(), this.attachEventListeners());
      }
      disconnectedCallback() {
        this.detachEventListeners();
      }
      cacheElements() {
        ((this.mainMenuDesktop = this.querySelector('.js-main-menu__desktop')),
          (this.megaMenuWrapper = this.querySelector(
            '.js-main-menu__mega-menu',
          )),
          (this.megaMenus = Array.from(this.querySelectorAll('.js-mega-menu'))),
          (this.overlay = this.querySelector('.js-main-menu__overlay')),
          (this.menuItems = Array.from(
            this.querySelectorAll('.js-top-main-navmenu__item-anchor'),
          )));
      }
      attachEventListeners() {
        (document.body.addEventListener(
          'sort-dropdown-open',
          this.boundSecondaryMenuDropdownClick,
        ),
          document.body.addEventListener(
            'cart-open',
            this.boundCartDrawerOpenHandler,
          ),
          this.overlay &&
            this.overlay.addEventListener(
              'mouseover',
              this.boundOverlayMouseOver,
            ),
          this.mainMenuDesktop &&
            this.mainMenuDesktop.addEventListener(
              'mouseover',
              this.boundMainMenuDesktopMouseOver,
            ),
          this.menuItems.forEach((e, t) => {
            ((e.boundMenuItemMouseOver = (e) => {
              (e.stopPropagation(), this.createMenuItemMouseOverHandler(t)(e));
            }),
              e.addEventListener('mouseover', e.boundMenuItemMouseOver));
          }),
          document.addEventListener('mousemove', this.boundDocumentMouseMove));
      }
      detachEventListeners() {
        (document.body.removeEventListener(
          'sort-dropdown-open',
          this.boundSecondaryMenuDropdownClick,
        ),
          document.body.removeEventListener(
            'cart-open',
            this.boundCartDrawerOpenHandler,
          ),
          this.overlay &&
            this.overlay.removeEventListener(
              'mouseover',
              this.boundOverlayMouseOver,
            ),
          this.mainMenuDesktop &&
            this.mainMenuDesktop.removeEventListener(
              'mouseover',
              this.boundMainMenuDesktopMouseOver,
            ),
          this.menuItems.forEach((e) => {
            (e.removeEventListener('mouseover', e.boundMenuItemMouseOver),
              (e.boundMenuItemMouseOver = void 0));
          }),
          document.removeEventListener(
            'mousemove',
            this.boundDocumentMouseMove,
          ));
      }
      createMenuItemMouseOverHandler(e) {
        return () => this.menuItemMouseOver(e);
      }
      menuItemMouseOver(e) {
        this.megaMenuWrapper &&
          this.overlay &&
          (this.showMegaMenu(e),
          this.setCurrentState(e),
          this.overlay.classList.remove('main-menu__overlay--hidden'),
          document.body.dispatchEvent(
            new CustomEvent('mega-menu-open', {
              bubbles: !0,
              detail: { source: 'menu' },
            }),
          ));
      }
      overlayMouseOver() {
        this.closeMegaMenus();
      }
      showMegaMenu(e) {
        if (e < 0 || e >= this.megaMenus.length) return;
        this.hideMegaMenus();
        const t = this.megaMenus[e];
        t && t.classList.remove('mega-menu--hidden');
      }
      hideMegaMenus() {
        this.megaMenus.forEach((e) => {
          e.classList.add('mega-menu--hidden');
        });
      }
      setCurrentState(e) {
        if (e < 0 || e >= this.menuItems.length) return;
        this.menuItems.forEach((e) => {
          e.classList.remove('top-main-navmenu__item-anchor--currrent');
        });
        const t = this.menuItems[e];
        t && t.classList.add('top-main-navmenu__item-anchor--currrent');
      }
      secondaryMenuDropdownClick() {
        this.closeMegaMenus();
      }
      cartDrawerOpenHandler() {
        this.closeMegaMenus();
      }
      closeMegaMenus() {
        this.overlay &&
          (this.hideMegaMenus(),
          this.menuItems.forEach((e) => {
            e.classList.remove('top-main-navmenu__item-anchor--currrent');
          }),
          this.overlay.classList.add('main-menu__overlay--hidden'));
      }
      documentMouseMove(e) {
        if (
          !this.megaMenuWrapper ||
          !this.overlay ||
          this.overlay.classList.contains('main-menu__overlay--hidden')
        )
          return;
        const t = this.megaMenuWrapper.getBoundingClientRect();
        e.clientY < t.top - 100 && this.closeMegaMenus();
      }
    }
    customElements.get('main-menu') || customElements.define('main-menu', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.closeBtn = null),
          (this.boundClose = this.close.bind(this)));
      }
      connectedCallback() {
        ((this.closeBtn = this.querySelector('.js-cart-header__close-btn')),
          this.closeBtn &&
            this.closeBtn.addEventListener('click', this.boundClose));
      }
      disconnectedCallback() {
        this.closeBtn &&
          this.closeBtn.removeEventListener('click', this.boundClose);
      }
      close() {
        this.closeBtn &&
          this.dispatchEvent(new CustomEvent('cart-close', { bubbles: !0 }));
      }
    }
    customElements.get('cart-header') ||
      customElements.define('cart-header', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.tabsContainer = null),
          (this.tabItems = []),
          (this.tabContentItems = []));
      }
      connectedCallback() {
        ((this.tabsContainer = this.querySelector('.tabs')),
          this.tabsContainer && this.initializeTabs());
      }
      disconnectedCallback() {
        this.tabItems.forEach((e) => {
          (e.removeEventListener('click', e.boundTabItemClick),
            delete e.boundTabItemClick);
        });
      }
      initializeTabs() {
        if (!this.tabsContainer) return;
        const e = this.tabsContainer.querySelector('.tab__list');
        if (!e) return;
        this.tabItems = Array.from(e.children);
        const t = this.tabsContainer.querySelector('.tab__content');
        t &&
          ((this.tabContentItems = Array.from(t.children)),
          this.tabItems.length === this.tabContentItems.length &&
            (this.tabItems.forEach((e, t) => {
              ((e.boundTabItemClick = this.createTabItemClickHandler(t)),
                e.addEventListener('click', e.boundTabItemClick));
            }),
            this.tabItems.length > 0 && this.setActiveTab(0)));
      }
      createTabItemClickHandler(e) {
        return () => this.tabItemClick(e);
      }
      tabItemClick(e) {
        this.setActiveTab(e);
      }
      setActiveTab(e) {
        e < 0 ||
          e >= this.tabItems.length ||
          (this.tabItems.forEach((e) => {
            (e.classList.remove('tab-item--active'),
              e.setAttribute('aria-selected', 'false'));
          }),
          this.tabContentItems.forEach((e) => {
            (e.classList.remove('tab-content-item--active'),
              e.setAttribute('aria-hidden', 'true'));
          }),
          this.tabItems[e].classList.add('tab-item--active'),
          this.tabItems[e].setAttribute('aria-selected', 'true'),
          this.tabItems[e].focus(),
          this.tabContentItems[e].classList.add('tab-content-item--active'),
          this.tabContentItems[e].setAttribute('aria-hidden', 'false'),
          this.dispatchEvent(
            new CustomEvent('active-tab-changed', {
              detail: { activeId: this.tabItems[e].id, activeIndex: e },
              bubbles: !0,
            }),
          ));
      }
    }
    customElements.get('custom-tabs') ||
      customElements.define('custom-tabs', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.swiper = null),
          (this.swiperInstance = null),
          (this.slidesPerGroup = 1));
      }
      connectedCallback() {
        if (
          ((this.slidesPerGroup = Number(this.dataset.slidesPerGroup)),
          Number.isNaN(this.slidesPerGroup) && (this.slidesPerGroup = 1),
          (this.swiper = this.querySelector('.js-swiper')),
          !this.swiper)
        )
          return;
        const e = this;
        try {
          this.swiperInstance = new Swiper(this.swiper, {
            spaceBetween: 24,
            slidesPerView: 'auto',
            slidesPerGroup: this.slidesPerGroup,
            allowTouchMove: !0,
            direction: 'horizontal',
            navigation: {
              nextEl: this.querySelector('.js-swiper-button-next'),
              prevEl: this.querySelector('.js-swiper-button-prev'),
            },
            breakpoints: {
              768: {
                spaceBetween: 'cart' === this.dataset.pageTemplate ? 24 : 32,
              },
            },
            on: {
              init() {
                setTimeout(
                  () => {
                    e.dispatchEvent(
                      new CustomEvent('product-slider-carousel-loaded', {
                        detail: {
                          source: 'price-slider',
                          sidesCount: this.slides.length,
                        },
                        bubbles: !0,
                      }),
                    );
                  },
                  100,
                  e,
                );
              },
            },
          });
        } catch (e) {}
      }
      disconnectedCallback() {
        if (this.swiperInstance) {
          try {
            this.swiperInstance.destroy();
          } catch (e) {}
          this.swiperInstance = null;
        }
      }
    }
    customElements.get('product-slider') ||
      customElements.define('product-slider', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.slidesPerGroup = 1),
          (this.observer = null),
          (this.swiper = null),
          (this.swiperInstance = null));
      }
      connectedCallback() {
        ((this.slidesPerGroup = Number(this.dataset.slidesPerGroup)),
          Number.isNaN(this.slidesPerGroup) && (this.slidesPerGroup = 1),
          this.initializeRecommendations(this.dataset.productId));
      }
      disconnectedCallback() {
        if (this.swiperInstance) {
          try {
            this.swiperInstance.destroy();
          } catch (e) {}
          this.swiperInstance = null;
        }
      }
      initializeRecommendations(e) {
        e &&
          (this.observer?.unobserve(this),
          (this.observer = new IntersectionObserver(
            (t, s) => {
              t[0].isIntersecting &&
                (s.unobserve(this), this.loadRecommendations(e));
            },
            { rootMargin: '0px 0px 400px 0px' },
          )),
          this.observer.observe(this));
      }
      loadRecommendations(e) {
        fetch(
          `${this.dataset.url}&product_id=${e}&section_id=${this.dataset.sectionId}`,
        )
          .then((e) => e.text())
          .then((e) => {
            const t = document.createElement('div');
            t.innerHTML = e;
            const s = t.querySelector('product-recommendations');
            (s?.innerHTML.trim().length && (this.innerHTML = s.innerHTML),
              this.initSwiper());
          })
          .catch((e) => {});
      }
      initSwiper() {
        if (((this.swiper = this.querySelector('.js-swiper')), !this.swiper))
          return;
        const e = this;
        try {
          this.swiperInstance = new Swiper(this.swiper, {
            spaceBetween: 24,
            slidesPerView: 'auto',
            allowTouchMove: !0,
            direction: 'horizontal',
            navigation: {
              nextEl: this.querySelector('.js-swiper-button-next'),
              prevEl: this.querySelector('.js-swiper-button-prev'),
            },
            breakpoints: {
              768: {
                spaceBetween: 'cart' === this.dataset.pageTemplate ? 24 : 32,
              },
            },
            on: {
              init() {
                setTimeout(
                  () => {
                    e.dispatchEvent(
                      new CustomEvent('product-slider-carousel-loaded', {
                        detail: {
                          source: 'product-recommendations',
                          sidesCount: this.slides.length,
                        },
                        bubbles: !0,
                      }),
                    );
                  },
                  100,
                  e,
                );
              },
            },
          });
        } catch (e) {}
      }
    }
    customElements.get('product-recommendations') ||
      customElements.define('product-recommendations', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.slidesPerGroup = 1),
          (this.sliderEmptyElem = null),
          (this.swiperElem = null),
          (this.swiperWrapperElem = null),
          (this.swiperInstance = null));
      }
      connectedCallback() {
        (this.setRecentlyViewedProducts(),
          this.cacheElements(),
          this.renderProducts());
      }
      disconnectedCallback() {
        this.destroySwiperInstance();
      }
      destroySwiperInstance() {
        if (this.swiperInstance) {
          try {
            this.swiperInstance.destroy();
          } catch (e) {}
          this.swiperInstance = null;
        }
      }
      cacheElements() {
        ((this.slidesPerGroup = Number(this.dataset.slidesPerGroup)),
          Number.isNaN(this.slidesPerGroup) && (this.slidesPerGroup = 1),
          (this.sliderEmptyElem = this.querySelector(
            '.js-product-slider__empty',
          )),
          (this.swiperElem = this.querySelector('.js-swiper')),
          (this.swiperWrapperElem = this.querySelector('.js-swiper-wrapper')));
      }
      setRecentlyViewedProducts() {
        const {
          id: e,
          handle: t,
          title: s,
          url: n,
          image: i,
          rating: r,
          reviews: a,
          price: o,
          comparePrice: c,
          productsToShow: l,
        } = this.dataset;
        if (!(e && t && s && n && l)) return;
        if ('undefined' == typeof Storage) return;
        const d = {
          id: e,
          handle: t,
          title: s,
          url: n,
          image: i,
          rating: r,
          reviews: a,
          price: o,
          comparePrice: c,
        };
        let h = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        ((h = h.filter((e) => e.id !== d.id)),
          h.unshift(d),
          h.length > l && h.pop(),
          localStorage.setItem('recentlyViewed', JSON.stringify(h)));
      }
      renderProducts() {
        if (
          !this.sliderEmptyElem ||
          !this.swiperElem ||
          !this.swiperWrapperElem
        )
          return;
        const e =
          Array.from(JSON.parse(localStorage.getItem('recentlyViewed'))) || [];
        if (!e || 0 === e.length)
          return (
            this.sliderEmptyElem.classList.remove(
              'product-slider__empty--hidden',
            ),
            void this.swiperElem.classList.add('swiper--hidden')
          );
        ((this.swiperWrapperElem.innerHTML = ''),
          e.forEach((e) => {
            let t = '';
            if (
              (e.rating && '' !== e.rating) ||
              (e.reviews && '' !== e.reviews)
            ) {
              let s = '';
              (Array.from({ length: 5 }, (t, n) => {
                const i = n + 1;
                let r = 100;
                (i > e.rating &&
                  (r = Math.round(Math.max(0, 100 - 100 * (i - e.rating)))),
                  (s += `<div class="star-rating__star js-star-rating__star--${i}">\n            <div class="star-rating__star-body">\n              <span class="star-rating__star-icon star-rating__star-icon--empty"></span>\n            </div>\n            <div\n              class="star-rating__star-body star-rating__star-body--filled js-star-rating__star-body--filled"\n              style="width: ${r}%"\n            >\n              <span class="star-rating__star-body star-rating__star-body--filled js-star-rating__star-body--filled"></span>\n            </div>\n          </div>`));
              }),
                (t = `\n          <div\n            class="star-rating js-star-rating"\n            role="img"\n            aria-label="Rated ${e.rating} out of 5 stars based on ${e.reviews} reviews"\n          >\n            <div class="star-rating__stars js-star-rating__stars">\n              ${s}\n            </div>\n            <span class="text text--regular star-rating__review js-star-rating__review text--center">\n              (${e.reviews})\n            </span>\n          </div>\n        `));
            }
            let s = `<img src="${e.image}" alt="${e.title}" class="image" />`;
            if (!e.image || String(e.image).indexOf('invalid url') > -1) {
              const e = document.querySelector('.js-product-placeholder-image');
              e && (s = e.innerHTML);
            }
            const n = `\n        <div class="swiper-slide">\n          <article class="product-card js-product-card">\n            <a class="anchor product-card__link" href="${e.url}">\n              <div class="product-card__image js-product-card-image__img">\n                ${s}\n              </div>\n              <section class="product-card__body js-product-card__body">\n                <div class="product-card__main">\n                  ${t}\n                  <span class="text text--regular product-card__title js-product-card__title">\n                    ${e.title}\n                  </span>\n                </div>\n                <div class="product-card__price">\n                  <span>\n                    <div class="price-display">\n                      <div class="price-display__main">\n                        <span class="price price--regular ${e.comparePrice && '' !== e.comparePrice && e.price !== e.comparePrice ? 'price--with-compare' : ''} js-price--regular ot-block-price" aria-label="Preis">\n                          ${e.price}\n                        </span>\n                        ${e.comparePrice && '' !== e.comparePrice && e.price !== e.comparePrice ? `\n                            <span class="price price--compare js-price--compare ot-block-price" aria-label="Original price">\n                              ${e.comparePrice}\n                            </span>\n                          ` : ''}\n                      </div>\n                    </div>\n                  </span>\n                </div>\n              </section>\n            </a>\n          </article>\n        </div>\n      `;
            this.swiperWrapperElem.innerHTML += n;
          }),
          this.sliderEmptyElem.classList.add('product-slider__empty--hidden'),
          this.swiperElem.classList.remove('swiper--hidden'),
          setTimeout(() => {
            this.initSwiper();
          }, 100));
      }
      initSwiper() {
        if (!this.swiperElem) return;
        const e = this;
        try {
          this.swiperInstance = new Swiper(this.swiperElem, {
            spaceBetween: 24,
            slidesPerView: 'auto',
            allowTouchMove: !0,
            direction: 'horizontal',
            navigation: {
              nextEl: this.querySelector('.js-swiper-button-next'),
              prevEl: this.querySelector('.js-swiper-button-prev'),
            },
            breakpoints: {
              768: {
                spaceBetween: 'cart' === this.dataset.pageTemplate ? 24 : 32,
              },
            },
            on: {
              init() {
                setTimeout(
                  () => {
                    e.dispatchEvent(
                      new CustomEvent('product-slider-carousel-loaded', {
                        detail: {
                          source: 'product-recently-views',
                          sidesCount: this.slides.length,
                        },
                        bubbles: !0,
                      }),
                    );
                  },
                  100,
                  e,
                );
              },
            },
          });
        } catch (e) {}
      }
    }
    customElements.get('product-recently-views') ||
      customElements.define('product-recently-views', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.swiperButtons = []),
          (this.productSliderSectionElem = null),
          (this.productSliders = []),
          (this.loadedProductSlidersCnt = 0),
          (this.slidesCnt = 0),
          (this.boundHandleActiveTabChanged =
            this.handleActiveTabChanged.bind(this)),
          (this.boundHandleProductSliderCarouselLoaded =
            this.handleProductSliderCarouselLoaded.bind(this)));
      }
      connectedCallback() {
        (this.cacheElements(),
          this.attachEventListeners(),
          this.toggleSwiperButtons(0));
      }
      disconnectedCallback() {
        this.detachEventListeners();
      }
      cacheElements() {
        ((this.productSliderSectionElem = this.querySelector(
          '.js-product-slider-section',
        )),
          (this.swiperButtons = Array.from(
            this.querySelectorAll('.js-swiper-button'),
          )),
          (this.productSliders = Array.from(
            this.querySelectorAll('.js-product-slider'),
          )));
      }
      attachEventListeners() {
        (this.addEventListener(
          'active-tab-changed',
          this.boundHandleActiveTabChanged,
        ),
          this.addEventListener(
            'product-slider-carousel-loaded',
            this.boundHandleProductSliderCarouselLoaded,
          ));
      }
      detachEventListeners() {
        (this.removeEventListener(
          'active-tab-changed',
          this.boundHandleActiveTabChanged,
        ),
          this.removeEventListener(
            'product-slider-carousel-loaded',
            this.boundHandleProductSliderCarouselLoaded,
          ));
      }
      handleActiveTabChanged(e) {
        const { activeIndex: t } = e.detail;
        'number' != typeof t || t < 0 || this.toggleSwiperButtons(t);
      }
      toggleSwiperButtons(e) {
        this.swiperButtons.forEach((e) => {
          e.classList.add('swiper-button--hidden');
        });
        const t = this.querySelector(`#panel-${e}`);
        t &&
          Array.from(t.querySelectorAll('.js-swiper-button')).forEach((e) => {
            e.classList.remove('swiper-button--hidden');
          });
      }
      handleProductSliderCarouselLoaded(e) {
        const { sidesCount: t } = e.detail;
        ((this.slidesCnt += t),
          (this.loadedProductSlidersCnt += 1),
          this.loadedProductSlidersCnt === this.productSliders.length &&
            0 === this.slidesCnt &&
            this.hideProductSliderSection());
      }
      hideProductSliderSection() {
        this.productSliderSectionElem &&
          this.productSliderSectionElem.classList.add(
            'product-slider-section--hidden',
          );
      }
    }
    customElements.get('product-slider-group') ||
      customElements.define('product-slider-group', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.inputElement = null),
          (this.boundInputChange = this.inputChange.bind(this)));
      }
      connectedCallback() {
        this.attachEventListeners();
      }
      disconnectedCallback() {
        this.inputElement.removeEventListener('input', this.boundInputChange);
      }
      attachEventListeners() {
        ((this.inputElement = this.querySelector('.js-number-input')),
          this.inputElement &&
            this.inputElement.addEventListener('input', this.boundInputChange));
      }
      inputChange(e) {
        this.dispatchEvent(
          new CustomEvent('number-change', {
            detail: {
              source: 'number-input',
              numberValue: parseFloat(e.target.value),
            },
            bubbles: !0,
          }),
        );
      }
    }
    customElements.get('number-input') ||
      customElements.define('number-input', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.decrementButton = null),
          (this.incrementButton = null),
          (this.inputField = null),
          (this.boundDecrement = this.decrement.bind(this)),
          (this.boundIncrement = this.increment.bind(this)),
          (this.boundValidate = this.validate.bind(this)));
      }
      connectedCallback() {
        ((this.decrementButton = this.querySelector('.js-minus')),
          (this.incrementButton = this.querySelector('.js-plus')),
          (this.inputField = this.querySelector('.js-quantity-input')),
          this.decrementButton &&
            this.incrementButton &&
            this.inputField &&
            (this.decrementButton.addEventListener(
              'click',
              this.boundDecrement,
            ),
            this.incrementButton.addEventListener('click', this.boundIncrement),
            this.inputField.addEventListener('input', this.boundValidate),
            this.resetDecrementButton()));
      }
      disconnectedCallback() {
        (this.decrementButton.removeEventListener('click', this.boundDecrement),
          this.incrementButton.removeEventListener(
            'click',
            this.boundIncrement,
          ),
          this.inputField.removeEventListener('input', this.boundValidate));
      }
      decrement() {
        const e = Math.max(1, parseInt(this.inputField.value, 10) || 1);
        (e > 1 &&
          ((this.inputField.value = e - 1),
          this.dispatchEvent(
            new CustomEvent('quantity-changed', {
              detail: { value: e - 1, index: this.inputField.dataset.index },
              bubbles: !0,
            }),
          )),
          this.decrementButton &&
            e <= 2 &&
            (this.decrementButton.disabled = !0));
      }
      increment() {
        const e = parseInt(this.inputField.value, 10) || 1;
        ((this.inputField.value = e + 1),
          this.dispatchEvent(
            new CustomEvent('quantity-changed', {
              detail: { value: e + 1, index: this.inputField.dataset.index },
              bubbles: !0,
            }),
          ),
          this.decrementButton && (this.decrementButton.disabled = !1));
      }
      validate() {
        const e = parseInt(this.inputField.value, 10);
        (Number.isNaN(e) || e < 1) && (this.inputField.value = 1);
      }
      resetDecrementButton() {
        if (!this.decrementButton) return;
        const e = parseInt(this.inputField.value, 10) || 1;
        this.decrementButton.disabled = !(e > 1);
      }
    }
    customElements.get('quantity-selector') ||
      customElements.define('quantity-selector', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.trashBtn = null),
          (this.boundTrashBtnClick = this.trashBtnClick.bind(this)));
      }
      connectedCallback() {
        ((this.trashBtn = this.querySelector('.button')),
          this.trashBtn &&
            this.trashBtn.addEventListener('click', this.boundTrashBtnClick));
      }
      disconnectedCallback() {
        this.trashBtn &&
          this.trashBtn.removeEventListener('click', this.boundTrashBtnClick);
      }
      trashBtnClick() {
        this.dataset.cartItemId &&
          this.dispatchEvent(
            new CustomEvent('cart-item-delete', {
              detail: { cartItemId: this.dataset.cartItemId },
              bubbles: !0,
            }),
          );
      }
    }
    customElements.get('trash-button') ||
      customElements.define('trash-button', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.trashBtn = null),
          (this.quantitySelectorChildren = []),
          (this.boundTrashBtnClick = this.trashBtnClick.bind(this)),
          (this.boundQuantitySelectorClick = (e) => {
            (e.preventDefault(), e.stopPropagation());
          }));
      }
      connectedCallback() {
        (this.addTrashBtnClickListener(),
          this.addQuantitySelectorClickListener());
      }
      addTrashBtnClickListener() {
        ((this.trashBtn = this.querySelector('.js-cart-item__trash-btn')),
          this.trashBtn &&
            this.trashBtn.addEventListener('click', this.boundTrashBtnClick));
      }
      addQuantitySelectorClickListener() {
        ((this.quantitySelectorChildren = Array.from(
          this.querySelectorAll('.js-quantity-input, .js-minus, .js-plus'),
        )),
          this.quantitySelectorChildren.forEach((e) => {
            e.addEventListener('click', this.boundQuantitySelectorClick);
          }));
      }
      trashBtnClick(e) {
        this.trashBtn && (e.preventDefault(), e.stopPropagation());
      }
      disconnectedCallback() {
        (this.trashBtn &&
          this.trashBtn.removeEventListener('click', this.boundTrashBtnClick),
          this.quantitySelectorChildren.forEach((e) => {
            e.removeEventListener('click', this.boundQuantitySelectorClick);
          }));
      }
    }
    customElements.get('cart-item') || customElements.define('cart-item', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.overlay = null),
          (this.emptyCartMessageElement = null),
          (this.shippingInfoItemsWrapper = null),
          (this.freeShippingIndicatorElement = null),
          (this.cartSummaryElement = null),
          (this.cartDrawerBodyElement = null),
          (this.subtotalInEuros = 0),
          (this.freeShippingThreshold = 0),
          (this.freeShippingText = ''),
          (this.freeShippingReachedText = ''),
          (this.isUpdating = !1),
          (this.boundCartUpdateHandler = this.cartUpdateHandler.bind(this)),
          (this.boundHandleClose = () => this.handleClose()),
          (this.boundHandleOpen = () => this.handleOpen()),
          (this.boundHandleDeleteCartItem = (e) =>
            this.handleDeleteCartItem(e)),
          (this.boundHandleChangeQuantity = (e) =>
            this.handleChangeQuantity(e)));
      }
      connectedCallback() {
        (this.cacheElements(), this.attachEventListeners());
      }
      disconnectedCallback() {
        this.detachEventListeners();
      }
      cacheElements() {
        ((this.overlay = this.querySelector('.js-cart-drawer__overlay')),
          (this.emptyCartMessageElement = this.querySelector(
            '.js-cart-drawer__empty-cart-message',
          )),
          (this.shippingInfoItemsWrapper = this.querySelector(
            '.js-cart-drawer__shipping-info-items-wrapper',
          )),
          (this.freeShippingIndicatorElement = this.querySelector(
            '.js-cart-drawer__free-shipping-indicator',
          )),
          (this.cartSummaryElement = this.querySelector(
            '.js-cart-drawer__cart-summary',
          )),
          (this.cartDrawerBodyElement = this.querySelector(
            '.js-cart-drawer__body',
          )),
          (this.freeShippingThreshold = this.dataset.freeShippingThreshold),
          (this.freeShippingText = this.dataset.freeShippingText),
          (this.freeShippingReachedText =
            this.dataset.freeShippingReachedText));
      }
      attachEventListeners() {
        (this.addEventListener(
          'keyup',
          (e) => 'Escape' === e.code && this.handleClose(),
        ),
          this.overlay.addEventListener('click', this.boundHandleClose),
          this.addEventListener(
            'cart-item-delete',
            this.boundHandleDeleteCartItem,
          ),
          this.addEventListener(
            'quantity-changed',
            this.boundHandleChangeQuantity,
          ),
          document.body.addEventListener('cart-open', this.boundHandleOpen),
          this.addEventListener('cart-close', this.boundHandleClose),
          document.body.addEventListener(
            'cart-update',
            this.boundCartUpdateHandler,
          ));
      }
      detachEventListeners() {
        (this.removeEventListener('keyup', this.boundHandleClose),
          this.overlay.removeEventListener('click', this.boundHandleClose),
          this.removeEventListener(
            'cart-item-delete',
            this.boundHandleDeleteCartItem,
          ),
          this.removeEventListener(
            'quantity-changed',
            this.boundHandleChangeQuantity,
          ),
          document.body.removeEventListener('cart-open', this.boundHandleOpen),
          this.removeEventListener('cart-close', this.boundHandleClose),
          document.body.removeEventListener(
            'cart-update',
            this.boundCartUpdateHandler,
          ));
      }
      handleDeleteCartItem(e) {
        const { cartItemId: t } = e.detail;
        if (!t) return;
        const s = String(t).replace(/\D/g, '');
        Number.isNaN(parseInt(s, 10)) || this.updateQuantity(s, 0);
      }
      handleChangeQuantity(e) {
        const { value: t, index: s } = e.detail;
        t < 1 || s < 1 || this.updateQuantity(s, t);
      }
      toggleClass(e, t, s) {
        e && e.classList.toggle(t, s);
      }
      handleOpen() {
        this.open();
      }
      handleClose() {
        this.close();
      }
      close() {
        if (!this.classList.contains('cart-drawer--hidden')) {
          (this.classList.add('cart-drawer--closed'),
            this.overlay &&
              this.overlay.classList.add('cart-drawer__overlay--hidden'));
          try {
            window.bodyScrollLock &&
              this.cartDrawerBodyElement &&
              window.bodyScrollLock.enableBodyScroll(
                this.cartDrawerBodyElement,
              );
          } catch (e) {}
        }
      }
      open() {
        if (!this.classList.contains('cart-drawer--hidden')) {
          (this.classList.remove('cart-drawer--closed'),
            this.overlay &&
              this.overlay.classList.remove('cart-drawer__overlay--hidden'));
          try {
            window.bodyScrollLock &&
              this.cartDrawerBodyElement &&
              window.bodyScrollLock.disableBodyScroll(
                this.cartDrawerBodyElement,
              );
          } catch (e) {}
        }
      }
      getSectionsToRender() {
        return [
          {
            id: 'cart-drawer',
            section: 'cart-drawer',
            selector: '.js-cart-drawer__inner',
          },
        ];
      }
      cartUpdateHandler(e) {
        const { source: t } = e.detail;
        'cart-items' !== t &&
          this.onCartUpdate(
            'product-info' === t || 'order-item' === t || 'order-detail' === t,
          );
      }
      onCartUpdate(e = !1) {
        fetch(`${window.routes.cart_url}?section_id=cart-drawer`)
          .then((e) => e.text())
          .then((t) => {
            const s = new DOMParser().parseFromString(t, 'text/html');
            s && (this.renderContents(s), e && this.open());
          })
          .catch((e) => {});
      }
      renderContents(e = null) {
        if (!e) return;
        [
          '#cart-data',
          '.js-cart-header__body',
          '.js-cart-drawer__free-shipping-indicator',
          '.js-cart-drawer__cart-item-group',
          '.js-cart-drawer__cart-summary',
        ].forEach((t) => {
          const s = document.querySelector(t),
            n = e.querySelector(t);
          if (
            (s && n && s.replaceWith(n.cloneNode(!0)),
            '.js-cart-drawer__cart-item-group' === t)
          ) {
            const e = Array.from(n.querySelectorAll('.js-cart-item')).length;
            this.toggleContents(e);
          }
        });
        const t = e.querySelector('#cart-data');
        try {
          const { cart: e } = JSON.parse(t.textContent);
          ((this.subtotalInEuros = Number.isFinite(e.total_price)
            ? (e.total_price / 100).toFixed(2)
            : '0.00'),
            this.updateCartIconCountBadge(e.item_count));
        } catch (e) {}
      }
      updateCartIconCountBadge(e = 0) {
        document.body.dispatchEvent(
          new CustomEvent('cart-item-count-change', {
            bubbles: !0,
            detail: { source: 'cart-drawer', count: e },
          }),
        );
      }
      updateQuantity(e, t, s, n) {
        if (this.isUpdating) return;
        this.isUpdating = !0;
        const i = this.getSectionsToRender(),
          r = JSON.stringify({
            line: e,
            quantity: t,
            sections: i.map((e) => e.section),
            sections_url: window.location.pathname,
          });
        fetch(`${window.routes.cart_change_url}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: r,
        })
          .then((e) => e.text())
          .then((s) => {
            const i = JSON.parse(s),
              r = document.getElementById(`Product-quantity-${e}`),
              a = this.querySelectorAll('.js-cart-item');
            if (i.errors)
              return (
                (r.value = r.getAttribute('value')),
                void this.updateErrorMessages(e, i.errors)
              );
            if (i.sections['cart-drawer']) {
              const e = new DOMParser().parseFromString(
                i.sections['cart-drawer'],
                'text/html',
              );
              e && this.renderContents(e);
            }
            const o = i.items[e - 1] ? i.items[e - 1].quantity : void 0;
            let c = '';
            (a.length === i.items.length &&
              o !== Number(r.value) &&
              (c =
                void 0 === o
                  ? window.cartStrings.error
                  : window.cartStrings.quantityError.replace('[quantity]', o)),
              0 !== t && this.updateErrorMessages(e, c),
              document.body.dispatchEvent(
                new CustomEvent('cart-update', {
                  bubbles: !0,
                  detail: {
                    source: 'cart-items',
                    productVariantId: n,
                    cartData: i,
                  },
                }),
              ));
          })
          .catch((e) => {
            this.dispatchEvent(
              new CustomEvent('cart-error', {
                bubbles: !0,
                detail: {
                  source: 'cart-drawer',
                  message: window.cartStrings.error,
                },
              }),
            );
          })
          .finally(() => {
            this.isUpdating = !1;
          });
      }
      updateErrorMessages(e, t) {}
      toggleContents(e = 0) {
        (this.toggleClass(
          this.cartDrawerBodyElement,
          'cart-drawer__body--with-padding-bottom',
          e > 0,
        ),
          this.toggleClass(
            this.emptyCartMessageElement,
            'empty-cart-message--hidden',
            e > 0,
          ),
          this.toggleClass(
            this.shippingInfoItemsWrapper,
            'cart-drawer__shipping-info-items-wrapper--hidden',
            0 === e,
          ),
          this.toggleClass(
            this.freeShippingIndicatorElement,
            'cart-drawer__free-shipping-indicator--hidden',
            0 === e,
          ),
          this.toggleClass(
            this.cartSummaryElement,
            'cart-drawer__cart-summary--hidden',
            0 === e,
          ));
      }
    }
    customElements.get('cart-drawer') ||
      customElements.define('cart-drawer', e);
  })());
