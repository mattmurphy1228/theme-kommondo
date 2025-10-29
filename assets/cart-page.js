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
            let n;
            return (...s) => {
              (clearTimeout(n), (n = setTimeout(() => e.apply(void 0, s), t)));
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
          n =
            0 === t
              ? this.emptyCartIconButtonAriaLabel
              : String(this.cartIconButtonAriaLabel).replace('{{ count }}', t);
        (this.cartIconButton.setAttribute('aria-label', n),
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
        const n = parseInt(window.theme.settings.suggestionsResultsLimit, 10);
        let s = '';
        ((s += window.theme.settings.suggestArticles ? 'article' : ''),
          (s += window.theme.settings.suggestCollections ? ',collection' : ''),
          (s += window.theme.settings.suggestProducts ? ',product' : ''),
          (s += window.theme.settings.suggestPages ? ',page' : ''),
          fetch(
            `${window.routes.predictiveSearchUrl}?q=${encodeURIComponent(t)}&resources[type]=${s}&resources[options][fields]=title,variants.sku,product_type,variants.title&resources[limit]=${n}&section_id=predictive-search`,
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
          n = t.closest('.checkbox');
        if (!n) return;
        const s = n.parentElement;
        s && this.toggleMobileMenuNav(t.checked, s);
      }
      toggleMobileMenuNav(e, t) {
        const n = t.nextElementSibling;
        if (n) {
          e
            ? n.classList.add('mobile-menu__nav--opened')
            : n.classList.remove('mobile-menu__nav--opened');
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
          (this.emptyCartMessageElement = null),
          (this.shippingInfoItemsWrapper = null),
          (this.freeShippingIndicatorElement = null),
          (this.cartPageSummaryElement = null),
          (this.cartSummaryElement = null),
          (this.subtotalInEuros = 0),
          (this.freeShippingThreshold = 0),
          (this.freeShippingText = ''),
          (this.freeShippingReachedText = ''),
          (this.isUpdating = !1),
          (this.boundCartUpdateHandler = this.cartUpdateHandler.bind(this)),
          (this.boundHandleChangeQuantity = (e) =>
            this.handleChangeQuantity(e)),
          (this.boundHandleDeleteCartItem = (e) =>
            this.handleDeleteCartItem(e)));
      }
      connectedCallback() {
        (this.cacheElements(), this.attachEventListeners());
      }
      disconnectedCallback() {
        this.detachEventListeners();
      }
      cacheElements() {
        ((this.emptyCartMessageElement = this.querySelector(
          '.js-cart-page__empty-cart-message',
        )),
          (this.shippingInfoItemsWrapper = this.querySelector(
            '.js-cart-page__shipping-info-items-wrapper',
          )),
          (this.freeShippingIndicatorElement = this.querySelector(
            '.js-cart-page__free-shipping-indicator',
          )),
          (this.cartPageSummaryElement = this.querySelector(
            '.js-cart-page__summary',
          )),
          (this.cartSummaryElement = this.querySelector(
            '.js-cart-page__cart-summary',
          )),
          (this.freeShippingThreshold = this.dataset.freeShippingThreshold),
          (this.freeShippingText = this.dataset.freeShippingText),
          (this.freeShippingReachedText =
            this.dataset.freeShippingReachedText));
      }
      attachEventListeners() {
        (document.body.addEventListener(
          'cart-update',
          this.boundCartUpdateHandler,
        ),
          this.addEventListener(
            'quantity-changed',
            this.boundHandleChangeQuantity,
          ),
          this.addEventListener(
            'cart-item-delete',
            this.boundHandleDeleteCartItem,
          ));
      }
      detachEventListeners() {
        (document.body.removeEventListener(
          'cart-update',
          this.boundCartUpdateHandler,
        ),
          this.removeEventListener(
            'quantity-changed',
            this.boundHandleChangeQuantity,
          ),
          this.removeEventListener(
            'cart-item-delete',
            this.boundHandleDeleteCartItem,
          ));
      }
      cartUpdateHandler(e) {
        const { source: t } = e.detail;
        'cart-items' !== t && this.onCartUpdate();
      }
      onCartUpdate() {
        fetch(`${window.routes.cart_url}?section_id=cart-page`)
          .then((e) => e.text())
          .then((e) => {
            const t = new DOMParser().parseFromString(e, 'text/html');
            t && this.renderContents(t);
          })
          .catch((e) => {});
      }
      renderContents(e = null) {
        if (!e) return;
        [
          '#cart-page-data',
          '.js-cart-page-header',
          '.js-cart-page__free-shipping-indicator',
          '.js-cart-page__cart-item-group',
          '.js-cart-page__cart-summary',
        ].forEach((t) => {
          const n = document.querySelector(t),
            s = e.querySelector(t);
          if (
            (n && s && n.replaceWith(s.cloneNode(!0)),
            '.js-cart-page__cart-item-group' === t)
          ) {
            const e = Array.from(s.querySelectorAll('.js-cart-item')).length;
            this.toggleContents(e);
          }
        });
        const t = e.querySelector('#cart-page-data');
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
            detail: { source: 'cart-page', count: e },
          }),
        );
      }
      handleChangeQuantity(e) {
        const { value: t, index: n } = e.detail;
        t < 1 || n < 1 || this.updateQuantity(n, t);
      }
      handleDeleteCartItem(e) {
        const { cartItemId: t } = e.detail;
        if (!t) return;
        const n = String(t).replace(/\D/g, '');
        Number.isNaN(parseInt(n, 10)) || this.updateQuantity(n, 0);
      }
      updateQuantity(e, t, n, s) {
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
          .then((n) => {
            const i = JSON.parse(n),
              r = document.getElementById(`Product-quantity-${e}`),
              o = this.querySelectorAll('.js-cart-item');
            if (i.errors)
              return (
                (r.value = r.getAttribute('value')),
                void this.updateErrorMessages(e, i.errors)
              );
            if (i.sections['cart-page']) {
              const e = new DOMParser().parseFromString(
                i.sections['cart-page'],
                'text/html',
              );
              e && this.renderContents(e);
            }
            const a = i.items[e - 1] ? i.items[e - 1].quantity : void 0;
            let c = '';
            (o.length === i.items.length &&
              a !== Number(r.value) &&
              (c =
                void 0 === a
                  ? window.cartStrings.error
                  : window.cartStrings.quantityError.replace('[quantity]', a)),
              0 !== t && this.updateErrorMessages(e, c),
              document.body.dispatchEvent(
                new CustomEvent('cart-update', {
                  bubbles: !0,
                  detail: {
                    source: 'cart-items',
                    productVariantId: s,
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
                  source: 'cart-page',
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
          this.emptyCartMessageElement,
          'empty-cart-message--hidden',
          e > 0,
        ),
          this.toggleClass(
            this.shippingInfoItemsWrapper,
            'cart-page__shipping-info-items-wrapper--hidden',
            0 === e,
          ),
          this.toggleClass(
            this.freeShippingIndicatorElement,
            'cart-page__free-shipping-indicator--hidden',
            0 === e,
          ),
          this.toggleClass(
            this.cartPageSummaryElement,
            'cart-page__summary--hidden',
            0 === e,
          ),
          this.toggleClass(
            this.cartSummaryElement,
            'cart-page__cart-summary--hidden',
            0 === e,
          ));
      }
      toggleClass(e, t, n) {
        e && e.classList.toggle(t, n);
      }
      getSectionsToRender() {
        return [
          {
            id: 'cart-page',
            section: 'cart-page',
            selector: '.js-cart-page__inner',
          },
        ];
      }
    }
    customElements.get('cart-page') || customElements.define('cart-page', e);
  })());
