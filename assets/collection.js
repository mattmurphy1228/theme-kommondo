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
            return (...i) => {
              (clearTimeout(n), (n = setTimeout(() => e.apply(void 0, i), t)));
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
        let i = '';
        ((i += window.theme.settings.suggestArticles ? 'article' : ''),
          (i += window.theme.settings.suggestCollections ? ',collection' : ''),
          (i += window.theme.settings.suggestProducts ? ',product' : ''),
          (i += window.theme.settings.suggestPages ? ',page' : ''),
          fetch(
            `${window.routes.predictiveSearchUrl}?q=${encodeURIComponent(t)}&resources[type]=${i}&resources[options][fields]=title,variants.sku,product_type,variants.title&resources[limit]=${n}&section_id=predictive-search`,
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
        const i = n.parentElement;
        i && this.toggleMobileMenuNav(t.checked, i);
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
        (super(), (this.accordions = new Set()));
      }
      connectedCallback() {
        ((this.accordions = new Set(this.querySelectorAll('details'))),
          this.accordions.forEach((e) => {
            e.addEventListener('toggle', this.handleToggle.bind(this));
          }));
      }
      disconnectedCallback() {
        (this.accordions.forEach((e) => {
          e.removeEventListener('toggle', this.handleToggle.bind(this));
        }),
          this.accordions.clear());
      }
      handleToggle(e) {
        const t = e.target;
        if (t.hasAttribute('open')) {
          this.accordions.forEach((e) => {
            e !== t && e.hasAttribute('open') && e.removeAttribute('open');
          });
          const e = t.parentNode;
          (e.firstChild !== t && e.insertBefore(t, e.firstChild),
            t.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        }
      }
    }
    customElements.get('collection-menu') ||
      customElements.define('collection-menu', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.btn = null),
          (this.menu = null),
          (this.selectedCountText = null),
          (this.checkboxes = []),
          (this.boundBtnClick = this.btnClick.bind(this)),
          (this.boundBtnClicked = this.btnClicked.bind(this)),
          (this.boundCheckboxChange = this.checkboxChange.bind(this)),
          (this.boundCheckboxChanged = this.checkboxChanged.bind(this)));
      }
      connectedCallback() {
        (this.addButtonEventListener(),
          this.addCheckboxEventListener(),
          (this.selectedCountText = this.querySelector(
            '.js-filter-dropdown__selected-count',
          )),
          this.selectedCountText && this.addCustomEventListener());
      }
      addButtonEventListener() {
        ((this.btn = this.querySelector('.js-filter-dropdown__button')),
          this.btn && this.btn.addEventListener('click', this.boundBtnClick));
      }
      addCheckboxEventListener() {
        ((this.menu = this.querySelector('.js-filter-dropdown__menu')),
          this.menu &&
            ((this.checkboxes = this.menu.querySelectorAll(
              '.js-checkbox__input',
            )),
            this.checkboxes.forEach((e) => {
              e.addEventListener('change', this.boundCheckboxChange);
            })));
      }
      addCustomEventListener() {
        (this.addEventListener(
          'filter-dropdown-button-click',
          this.boundBtnClicked,
        ),
          this.addEventListener(
            'filter-dropdown-checkbox-change',
            this.boundCheckboxChanged,
          ));
      }
      disconnectedCallback() {
        (this.btn && this.btn.removeEventListener('click', this.boundBtnClick),
          this.checkboxes.forEach((e) => {
            e.removeEventListener('change', this.boundCheckboxChange);
          }),
          this.removeEventListener(
            'filter-dropdown-button-click',
            this.boundBtnClicked,
          ),
          this.removeEventListener(
            'filter-dropdown-checkbox-change',
            this.boundCheckboxChanged,
          ));
      }
      btnClick(e) {
        (e.stopPropagation(), (this.btn = e.currentTarget));
        const t = this.btn.getAttribute('aria-expanded');
        (this.btn.setAttribute(
          'aria-expanded',
          'false' === t ? 'true' : 'false',
        ),
          this.dispatchEvent(
            new CustomEvent('filter-dropdown-button-click', {
              detail: {
                buttonId: e.currentTarget.id,
                shouldExpand: 'false' === t,
              },
              bubbles: !0,
            }),
          ));
      }
      btnClicked(e) {
        if (!this.menu) return;
        const t = e.detail?.shouldExpand;
        t
          ? this.menu.classList.remove('filter-dropdown__menu--hidden')
          : this.menu.classList.add('filter-dropdown__menu--hidden');
      }
      checkboxChange() {
        const e = [];
        this.checkboxes.forEach((t) => {
          t.checked && e.push(t.value);
        });
        const t = e.length,
          n = new CustomEvent('filter-dropdown-checkbox-change', {
            detail: { selectedCount: t },
            bubbles: !0,
          });
        this.dispatchEvent(n);
      }
      checkboxChanged(e) {
        if (!this.btn || !this.selectedCountText) return;
        const t = e.detail?.selectedCount;
        t
          ? ((this.selectedCountText.textContent = t),
            this.selectedCountText.classList.remove(
              'filter-dropdown__selected-count--hidden',
            ),
            this.btn.setAttribute(
              'aria-label',
              `Filter dropdown with ${t} selected count`,
            ))
          : ((this.selectedCountText.textContent = 0),
            this.selectedCountText.classList.add(
              'filter-dropdown__selected-count--hidden',
            ),
            this.btn.setAttribute(
              'aria-label',
              'Filter dropdown without selected count',
            ));
      }
    }
    customElements.get('filter-dropdown') ||
      customElements.define('filter-dropdown', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.filterTimeout = null),
          (this.elements = {
            allFilterBtn: null,
            allFilterBtnText: null,
            filterDropdownsWrapper: null,
          }),
          (this.texts = { allFilter: '', allFilterMobile: '' }),
          (this.boundHandlers = {
            allFilterBtnClick: this.allFilterBtnClick.bind(this),
            resize: this.resizeHandler.bind(this),
          }));
      }
      connectedCallback() {
        (this.initializeTexts(),
          this.initializeElements(),
          this.attachEventListeners());
      }
      disconnectedCallback() {
        (this.removeEventListeners(),
          this.filterTimeout && clearTimeout(this.filterTimeout));
      }
      initializeTexts() {
        ((this.texts.allFilter = this.dataset.allFilterText ?? ''),
          (this.texts.allFilterMobile =
            this.dataset.allFilterTextOnMobile ?? ''));
      }
      initializeElements() {
        ((this.elements.allFilterBtn = this.querySelector(
          '.js-filter-group__all-filter-btn',
        )),
          this.elements.allFilterBtn &&
            ((this.elements.filterDropdownsWrapper = this.querySelector(
              '.js-filter-group__dropdowns',
            )),
            this.elements.filterDropdownsWrapper &&
              ((this.elements.allFilterBtnText =
                this.elements.allFilterBtn.querySelector('.button__text')),
              this.elements.allFilterBtnText)));
      }
      attachEventListeners() {
        (this.elements.allFilterBtn &&
          this.elements.allFilterBtn.addEventListener(
            'click',
            this.boundHandlers.allFilterBtnClick,
          ),
          window.addEventListener('resize', this.boundHandlers.resize),
          this.addEventListener('change', this.handleFilterDropdownChange));
      }
      removeEventListeners() {
        (this.elements.allFilterBtn &&
          this.elements.allFilterBtn.removeEventListener(
            'click',
            this.boundHandlers.allFilterBtnClick,
          ),
          window.removeEventListener('resize', this.boundHandlers.resize),
          this.removeEventListener('change', this.handleFilterDropdownChange));
      }
      allFilterBtnClick() {
        this.elements.allFilterBtn &&
          document.body.dispatchEvent(
            new CustomEvent('open-advanced-filter-drawer', { bubbles: !0 }),
          );
      }
      resizeHandler() {
        if (!this.elements.filterDropdownsWrapper) return;
        const e = window.innerWidth < 1024;
        (this.elements.filterDropdownsWrapper.setAttribute('aria-hidden', e),
          this.updateAdvancedFilterDrawerButtonText(e));
      }
      updateAdvancedFilterDrawerButtonText(e) {
        this.elements.allFilterBtnText &&
          (this.elements.allFilterBtnText.textContent = e
            ? this.texts.allFilterMobile
            : this.texts.allFilter);
      }
      handleFilterDropdownChange(e) {
        const { target: t } = e;
        'INPUT' === t.tagName &&
          (this.filterTimeout && clearTimeout(this.filterTimeout),
          (this.filterTimeout = setTimeout(() => {
            try {
              const e = new URL(window.location.href),
                { name: n, value: i, checked: s } = t;
              if (s) e.searchParams.append(n, i);
              else {
                const t = e.searchParams.getAll(n);
                (e.searchParams.delete(n),
                  t
                    .filter((e) => e !== i)
                    .forEach((t) => e.searchParams.append(n, t)));
              }
              window.location.href = e.toString();
            } catch (e) {}
          }, 300)));
      }
    }
    customElements.get('filter-group') ||
      customElements.define('filter-group', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.closeBtn = null),
          (this.boundClose = this.close.bind(this)));
      }
      connectedCallback() {
        ((this.closeBtn = this.querySelector('.js-filter-header__close-btn')),
          this.closeBtn &&
            this.closeBtn.addEventListener('click', this.boundClose));
      }
      disconnectedCallback() {
        this.closeBtn &&
          this.closeBtn.removeEventListener('click', this.boundClose);
      }
      close() {
        this.closeBtn &&
          this.dispatchEvent(
            new CustomEvent('filter-drawer-close', { bubbles: !0 }),
          );
      }
    }
    customElements.get('filter-header') ||
      customElements.define('filter-header', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.resetBtn = null),
          (this.applyBtn = null),
          (this.boundReset = this.reset.bind(this)),
          (this.boundApply = this.apply.bind(this)));
      }
      connectedCallback() {
        ((this.resetBtn = this.querySelector('.js-filter-actions__reset-btn')),
          this.resetBtn &&
            (this.resetBtn.addEventListener('click', this.boundReset),
            (this.applyBtn = this.querySelector(
              '.js-filter-actions__apply-btn',
            )),
            this.applyBtn &&
              this.applyBtn.addEventListener('click', this.boundApply)));
      }
      disconnectedCallback() {
        (this.resetBtn &&
          this.resetBtn.removeEventListener('click', this.boundReset),
          this.applyBtn &&
            this.applyBtn.removeEventListener('click', this.boundApply));
      }
      reset() {
        this.resetBtn &&
          document.body.dispatchEvent(
            new CustomEvent('reset-filters', {
              bubbles: !0,
              detail: { source: 'filter-actions' },
            }),
          );
      }
      apply() {
        this.applyBtn &&
          document.body.dispatchEvent(
            new CustomEvent('apply-filters', {
              bubbles: !0,
              detail: { source: 'filter-actions' },
            }),
          );
      }
    }
    customElements.get('filter-actions') ||
      customElements.define('filter-actions', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.summarySelectedTextElement = null),
          (this.radioInputs = []),
          (this.handleRadioChange = this.handleRadioChange.bind(this)));
      }
      connectedCallback() {
        ((this.summarySelectedTextElement = this.querySelector(
          '.js-sort-accordion__summary-selected',
        )),
          this.summarySelectedTextElement &&
            ((this.radioInputs = Array.from(
              this.querySelectorAll('.js-radio__input'),
            )),
            this.addEventListener('radio-change', this.handleRadioChange)));
      }
      disconnectedCallback() {
        this.removeEventListener('radio-change', this.handleRadioChange);
      }
      handleRadioChange(e) {
        const { id: t, label: n, checked: i } = e?.detail || {};
        i &&
          (this.radioInputs.forEach((e) => {
            e.id === t
              ? e.setAttribute('checked', '')
              : e.removeAttribute('checked');
          }),
          this.summarySelectedTextElement &&
            (this.summarySelectedTextElement.innerText = n),
          this.dispatchEvent(
            new CustomEvent('sort-product', {
              bubbles: !0,
              detail: {
                source: 'sort-accordion',
                option_id: t,
                option_label: n,
              },
            }),
          ));
      }
    }
    customElements.get('sort-accordion') ||
      customElements.define('sort-accordion', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.summarySelectedTextElement = null),
          (this.checkboxInputs = []),
          (this.handleCheckboxChange = this.handleCheckboxChange.bind(this)));
      }
      connectedCallback() {
        ((this.summarySelectedTextElement = this.querySelector(
          '.js-filter-accordion__summary-selected',
        )),
          this.summarySelectedTextElement &&
            ((this.checkboxInputs = Array.from(
              this.querySelectorAll('input[type="checkbox"]'),
            )),
            this.addEventListener('change', this.handleCheckboxChange)));
      }
      disconnectedCallback() {
        this.removeEventListener('change', this.handleCheckboxChange);
      }
      handleCheckboxChange() {
        if (!this.checkboxInputs.length) return;
        const e = this.checkboxInputs.filter((e) => e.checked),
          t = e.map(({ id: e }) => e);
        (this.dispatchEvent(
          new CustomEvent('filter-product', {
            bubbles: !0,
            detail: { source: 'filter-accordion', checked_options: t },
          }),
        ),
          this.updateSummary(e.length));
      }
      updateSummary(e) {
        this.summarySelectedTextElement &&
          ((this.summarySelectedTextElement.innerText = e),
          this.summarySelectedTextElement.classList.toggle(
            'filter-accordion__summary-selected--hidden',
            0 === e,
          ));
      }
    }
    customElements.get('filter-accordion') ||
      customElements.define('filter-accordion', e);
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
      type = '';
      handleNumberChange = (e) => {
        const { numberValue: t } = e.detail,
          n = Number(t);
        Number.isNaN(n) ||
          this.dispatchEvent(
            new CustomEvent('price-change', {
              detail: { source: 'price-input', price: n, type: this.type },
              bubbles: !0,
            }),
          );
      };
      connectedCallback() {
        ((this.type = this.dataset.type),
          this.addEventListener('number-change', this.handleNumberChange));
      }
      disconnectedCallback() {
        this.removeEventListener('number-change', this.handleNumberChange);
      }
    }
    customElements.get('price-input') ||
      customElements.define('price-input', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.minPriceInputElement = null),
          (this.maxPriceInputElement = null),
          (this.errorTextWrapper = null),
          (this.errorTextElement = null),
          (this.minPrice = 0),
          (this.maxPrice = 0),
          (this.rangeMax = 0),
          (this.handlePriceChange = this.handlePriceChange.bind(this)));
      }
      connectedCallback() {
        ((this.minPrice = Number(this.dataset.minPrice ?? 0)),
          (this.maxPrice = Number(this.dataset.maxPrice ?? 0)),
          (this.rangeMax = Number(this.dataset.rangeMax ?? 0)),
          this.cacheElements(),
          this.addEventListener('price-change', this.handlePriceChange));
      }
      disconnectedCallback() {
        this.removeEventListener('price-change', this.handlePriceChange);
      }
      cacheElements() {
        ((this.minPriceInputElement = this.querySelector(
          '.js-price-range__min .js-number-input',
        )),
          (this.maxPriceInputElement = this.querySelector(
            '.js-price-range__max .js-number-input',
          )),
          (this.errorTextWrapper = this.querySelector(
            '.js-price-range__error',
          )),
          (this.errorTextElement = this.querySelector(
            '.js-price-range__error-text',
          )),
          this.minPriceInputElement &&
            (this.minPriceInputElement.value = parseFloat(
              (this.minPrice / 100).toFixed(2),
            )),
          this.maxPriceInputElement &&
            (this.maxPriceInputElement.value = parseFloat(
              (this.maxPrice / 100).toFixed(2),
            )));
      }
      handlePriceChange(e) {
        const { price: t, type: n } = e.detail;
        'min' === n
          ? this.validateMinPrice(100 * t)
          : 'max' === n
            ? this.validateMaxPrice(100 * t)
            : ((this.errorTextElement.textContent = 'Invalid price type!'),
              this.errorTextWrapper.classList.remove(
                'price-range__error--hidden',
              ));
      }
      validateMinPrice(e) {
        return e < 0
          ? ((this.errorTextElement.textContent =
              'The minimum price should be ≥ 0.'),
            void this.errorTextWrapper.classList.remove(
              'price-range__error--hidden',
            ))
          : e > this.maxPrice
            ? ((this.errorTextElement.textContent =
                'Min price must be ≤ max price.'),
              void this.errorTextWrapper.classList.remove(
                'price-range__error--hidden',
              ))
            : (this.errorTextWrapper.classList.add(
                'price-range__error--hidden',
              ),
              void (this.minPrice = Number(e)));
      }
      validateMaxPrice(e) {
        return e < 0
          ? ((this.errorTextElement.textContent =
              'The maximum price should be ≥ 0.'),
            void this.errorTextWrapper.classList.remove(
              'price-range__error--hidden',
            ))
          : e < this.minPrice
            ? ((this.errorTextElement.textContent =
                'Max price must be ≥ min price.'),
              void this.errorTextWrapper.classList.remove(
                'price-range__error--hidden',
              ))
            : (this.errorTextWrapper.classList.add(
                'price-range__error--hidden',
              ),
              void (this.maxPrice = Number(e)));
      }
    }
    customElements.get('price-range') ||
      customElements.define('price-range', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.minSliderElement = null),
          (this.maxSliderElement = null),
          (this.boundMinSliderChange = this.minSliderChange.bind(this)),
          (this.boundMaxSliderChange = this.maxSliderChange.bind(this)));
      }
      connectedCallback() {
        (this.cacheElements(),
          this.attachEventListeners(),
          this.fillSlider(this.minSliderElement, this.maxSliderElement),
          this.setToggleAccessible());
      }
      disconnectedCallback() {
        this.removeEventListeners();
      }
      cacheElements() {
        ((this.minSliderElement = this.querySelector(
          '.js-price-slider__slider--min',
        )),
          (this.maxSliderElement = this.querySelector(
            '.js-price-slider__slider--max',
          )));
      }
      attachEventListeners() {
        (this.minSliderElement?.addEventListener(
          'input',
          this.boundMinSliderChange,
        ),
          this.maxSliderElement?.addEventListener(
            'input',
            this.boundMaxSliderChange,
          ));
      }
      removeEventListeners() {
        (this.minSliderElement?.removeEventListener(
          'input',
          this.boundMinSliderChange,
        ),
          this.maxSliderElement?.removeEventListener(
            'input',
            this.boundMaxSliderChange,
          ));
      }
      minSliderChange() {
        const e = parseFloat(this.minSliderElement.value),
          t = parseFloat(this.maxSliderElement.value);
        (this.fillSlider(this.minSliderElement, this.maxSliderElement),
          e > t
            ? ((this.minSliderElement.value = t),
              this.firePriceRangeChangeEvent(t, -1))
            : this.firePriceRangeChangeEvent(e, -1));
      }
      maxSliderChange() {
        const e = parseFloat(this.minSliderElement.value),
          t = parseFloat(this.maxSliderElement.value);
        (this.fillSlider(this.minSliderElement, this.maxSliderElement),
          this.setToggleAccessible(),
          e <= t
            ? ((this.maxSliderElement.value = t),
              this.firePriceRangeChangeEvent(-1, t))
            : ((this.maxSliderElement.value = e),
              this.firePriceRangeChangeEvent(-1, e)));
      }
      fillSlider(e, t) {
        if (!e || !t) return;
        const n = t.max - t.min,
          i = e.value - t.min,
          s = t.value - t.min;
        this.maxSliderElement.style.background = `linear-gradient(\n      to right,\n      var(--color-grey-medium) 0%,\n      var(--color-grey-medium) ${(i / n) * 100}%,\n      var(--color-basic-black) ${(i / n) * 100}%,\n      var(--color-basic-black) ${(s / n) * 100}%,\n      var(--color-grey-medium) ${(s / n) * 100}%,\n      var(--color-grey-medium) 100%\n    )`;
      }
      setToggleAccessible() {
        this.maxSliderElement &&
          (this.maxSliderElement.style.zIndex =
            Number(this.maxSliderElement.value) <= 0 ? 2 : 0);
      }
      firePriceRangeChangeEvent(e, t) {
        this.dispatchEvent(
          new CustomEvent('price-range-change', {
            detail: { source: 'price-slider', min: e, max: t },
            bubbles: !0,
          }),
        );
      }
    }
    customElements.get('price-slider') ||
      customElements.define('price-slider', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(), (this.minPriceField = null), (this.maxPriceField = null));
      }
      connectedCallback() {
        (this.cacheElements(),
          (this.boundHandlePriceRangeChange =
            this.handlePriceRangeChange.bind(this)),
          this.addEventListener(
            'price-range-change',
            this.boundHandlePriceRangeChange,
          ));
      }
      disconnectedCallback() {
        this.removeEventListener(
          'price-range-change',
          this.boundHandlePriceRangeChange,
        );
      }
      cacheElements() {
        ((this.minPriceField = this.querySelector(
          '.js-price-range__min .js-number-input',
        )),
          (this.maxPriceField = this.querySelector(
            '.js-price-range__max .js-number-input',
          )));
      }
      handlePriceRangeChange(e) {
        if (!this.minPriceField || !this.maxPriceField) return;
        const { min: t, max: n } = e.detail;
        (t >= 0 && (this.minPriceField.value = t),
          n >= 0 && (this.maxPriceField.value = n));
      }
    }
    customElements.get('price-accordion-content') ||
      customElements.define('price-accordion-content', e);
  })(),
  (() => {
    class e extends HTMLElement {
      constructor() {
        (super(),
          (this.boundHandleClose = this.handleClose.bind(this)),
          (this.boundHandleOpen = this.handleOpen.bind(this)),
          (this.boundHandleClickOutside = this.handleClickOutside.bind(this)),
          (this.boundUpdateResetButton = this.updateResetButton.bind(this)));
      }
      connectedCallback() {
        (this.attachEventListeners(), this.updateResetButton());
      }
      disconnectedCallback() {
        (this.removeEventListener('filter-drawer-close', this.boundHandleClose),
          document.body.removeEventListener(
            'open-advanced-filter-drawer',
            this.boundHandleOpen,
          ),
          document.removeEventListener('click', this.boundHandleClickOutside),
          this.removeEventListener('change', this.boundUpdateResetButton));
      }
      attachEventListeners() {
        (this.addEventListener('filter-drawer-close', this.boundHandleClose),
          document.body.addEventListener(
            'open-advanced-filter-drawer',
            this.boundHandleOpen,
          ),
          document.addEventListener('click', this.boundHandleClickOutside),
          this.addEventListener('change', this.boundUpdateResetButton));
      }
      handleClose() {
        this.classList.add('filter-drawer--closed');
      }
      handleOpen() {
        this.classList.remove('filter-drawer--closed');
      }
      handleClickOutside(e) {
        const t = this.querySelector('.filter-drawer__inner');
        t &&
          !t.contains(e.target) &&
          !e.target.closest('.js-filter-group__all-filter-btn') &&
          !this.classList.contains('filter-drawer--closed') &&
          this.handleClose();
      }
      updateResetButton() {
        const e = this.querySelector('.js-filter-actions__reset-btn');
        e &&
          (0 === this.querySelectorAll('input[type="checkbox"]:checked').length
            ? (e.setAttribute('disabled', ''), (e.disabled = !0))
            : (e.removeAttribute('disabled'), (e.disabled = !1)));
      }
    }
    customElements.get('filter-drawer') ||
      customElements.define('filter-drawer', e);
  })(),
  (() => {
    'use strict';
    const e = (e) =>
      Number(e).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
    class t extends HTMLElement {
      constructor() {
        (super(),
          (this.productsPerPage = 24),
          (this.paginationDirection = 'next'),
          (this.endCursor = null),
          (this.hasNextPage = !1),
          (this.hasPreviousPage = !1),
          (this.startCursor = null),
          (this.after = null),
          (this.before = null),
          (this.first = this.productsPerPage),
          (this.last = null),
          (this.productGridElem = null),
          (this.prevPaginationBtn = null),
          (this.nextPaginationBtn = null),
          (this.productPlaceholderImageElem = null),
          (this.boundHandlePrevPaginationBtnClick =
            this.handlePrevPaginationBtnClick.bind(this)),
          (this.boundHandleNextPaginationBtnClick =
            this.handleNextPaginationBtnClick.bind(this)),
          (this.storeFrontApiClient = null));
      }
      connectedCallback() {
        (this.cacheElements(),
          this.attachEventListeners(),
          this.initFromSearchUrl(),
          this.searchProducts());
      }
      disconnectedCallback() {
        this.detachEventListeners();
      }
      getCollectionHandle() {
        const e = window.location.pathname.split('/');
        return e.length < 3 ? null : e[2];
      }
      getSortKey() {
        const e = window.location.search,
          t = new URLSearchParams(e);
        return t.has('sort_by') ? t.get('sort_by') : null;
      }
      cacheElements() {
        ((this.productGridElem = this.querySelector('.js-product-grid')),
          (this.prevPaginationBtn = this.querySelector(
            '.js-pagination-button--prev',
          )),
          (this.nextPaginationBtn = this.querySelector(
            '.js-pagination-button--next',
          )),
          (this.productPlaceholderImageElem = this.querySelector(
            '.js-product-placeholder-image',
          )),
          (this.productsPerPage = Number(this.dataset.productsPerPage) ?? 24),
          ShopifyStorefrontAPIClient &&
            (this.storeFrontApiClient =
              ShopifyStorefrontAPIClient.createStorefrontApiClient({
                storeDomain: 'https://kommondo.myshopify.com',
                apiVersion: '2025-01',
                publicAccessToken: '8b9355555e1431ae5ed59843aa9424ff',
              })));
      }
      attachEventListeners() {
        (this.prevPaginationBtn &&
          this.prevPaginationBtn.addEventListener(
            'click',
            this.boundHandlePrevPaginationBtnClick,
          ),
          this.nextPaginationBtn &&
            this.nextPaginationBtn.addEventListener(
              'click',
              this.boundHandleNextPaginationBtnClick,
            ));
      }
      detachEventListeners() {
        (this.prevPaginationBtn &&
          this.prevPaginationBtn.removeEventListener(
            'click',
            this.boundHandlePrevPaginationBtnClick,
          ),
          this.nextPaginationBtn &&
            this.nextPaginationBtn.removeEventListener(
              'click',
              this.boundHandleNextPaginationBtnClick,
            ));
      }
      applySortKey() {
        let e = 'MANUAL',
          t = !1;
        switch (this.getSortKey()) {
          case 'title-ascending':
            ((e = 'TITLE'), (t = !1));
            break;
          case 'title-descending':
            ((e = 'TITLE'), (t = !0));
            break;
          case 'price-ascending':
            ((e = 'PRICE'), (t = !1));
            break;
          case 'price-descending':
            ((e = 'PRICE'), (t = !0));
            break;
          case 'created-ascending':
            ((e = 'CREATED'), (t = !1));
            break;
          case 'created-descending':
            ((e = 'CREATED'), (t = !0));
            break;
          default:
            e = 'MANUAL';
        }
        return { sortKey: e, reverse: t };
      }
      customStringify(e) {
        return `{ ${Object.keys(e)
          .map((t) => {
            const n = 'true' === e[t] || ('false' !== e[t] && e[t]);
            return `${t}: ${'string' == typeof n ? `"${n}"` : n}`;
          })
          .join(', ')} }`;
      }
      applyFilter() {
        let e = [{ tag: 'search_show' }];
        const t = window.location.search,
          n = new URLSearchParams(t);
        if (n.has('filter.v.availability')) {
          const t = n.getAll('filter.v.availability');
          if (1 === t.length) {
            const n = t[0];
            1 === Number(n)
              ? (e = [...e, { available: !0 }])
              : 0 === Number(n) && (e = [...e, { available: !1 }]);
          }
        }
        if (n.has('filter.v.price.gte') || n.has('filter.v.price.lte')) {
          let t = {};
          (n.has('filter.v.price.gte') &&
            (t = { ...t, min: parseFloat(n.get('filter.v.price.gte')) }),
            n.has('filter.v.price.lte') &&
              (t = { ...t, max: parseFloat(n.get('filter.v.price.lte')) }),
            (e = [...e, { price: t }]));
        }
        return (
          n.has('filter.p.m.custom.sku') &&
            (e = [
              ...e,
              {
                productMetafield: {
                  key: 'sku',
                  namespace: 'custom',
                  value: String(n.get('filter.p.m.custom.sku')),
                },
              },
            ]),
          e
        );
      }
      async searchProducts(e = !1) {
        if (!this.storeFrontApiClient) return;
        const t = this.getCollectionHandle();
        if (!t) return;
        const { sortKey: n, reverse: i } = this.applySortKey(),
          s = this.applyFilter();
        e
          ? ((this.after && 'null' !== this.after) || (this.after = null),
            (this.before && 'null' !== this.before) || (this.before = null))
          : ((this.after = null), (this.before = null));
        const r = {
          handle: t,
          after: this.after,
          before: this.before,
          first: this.first,
          last: this.last,
          reverse: i,
          sortKey: n,
          filters: s,
          productMetafieldNamespace: 'custom',
          productMetafieldKey: 'manufacturer_logo',
        };
        try {
          const { data: e, errors: t } = await this.storeFrontApiClient.request(
            '\n      query fetchProductsInCollection(\n        $handle: String!,\n        $after: String,\n        $before: String,\n        $first: Int,\n        $last: Int,\n        $reverse: Boolean,\n        $filters: [ProductFilter!],\n        $sortKey: ProductCollectionSortKeys,\n        $productMetafieldNamespace: String,\n        $productMetafieldKey: String!\n      ) {\n        collection(handle: $handle) {\n          title\n          handle\n          id\n          description\n          descriptionHtml\n          products(\n            after: $after,\n            before: $before,\n            first: $first,\n            last: $last,\n            reverse: $reverse,\n            sortKey: $sortKey,\n            filters: $filters\n          ) {\n            edges {\n              cursor\n              node {\n                ... on Product {\n                  id\n                  title\n                  handle\n                  description\n                  tags\n                  featuredImage {\n                    altText\n                    url\n                    width\n                    height\n                  }\n                  selectedOrFirstAvailableVariant {\n                    sku\n                  }\n                  priceRange {\n                    minVariantPrice {\n                      amount\n                      currencyCode\n                    }\n                    maxVariantPrice {\n                      amount\n                      currencyCode\n                    }\n                  }\n                  compareAtPriceRange {\n                    minVariantPrice {\n                      amount\n                      currencyCode\n                    }\n                    maxVariantPrice {\n                      amount\n                      currencyCode\n                    }\n                  }\n                  metafield(namespace: $productMetafieldNamespace, key: $productMetafieldKey) {\n                    key\n                    namespace\n                    type\n                    value\n                  }\n                }\n              }\n            }\n            pageInfo {\n              endCursor\n              hasNextPage\n              hasPreviousPage\n              startCursor\n            }\n          }\n        } \n      }\n    ',
            { variables: r },
          );
          if (t) throw new Error('Error fetching products');
          (await this.renderProducts(e.collection.products.edges),
            this.renderPagination(e.collection.products.pageInfo));
        } catch (e) {}
      }
      async fetchVariantGroup(e) {
        try {
          const t = await fetch(`/apps/variants-grouper/find-group/${e}`);
          if (!t.ok) throw new Error('Network response was not ok');
          return await t.json();
        } catch (e) {}
        return null;
      }
      determinePriceFromText(e) {
        if (!e || 0 === e.length) return '';
        const t = e.map((e) => parseFloat(e.price)).filter((e) => e > 0);
        return [...new Set(t)].length > 1
          ? this.dataset.priceFromText.concat(' ')
          : '';
      }
      async renderProducts(e) {
        if (((this.productGridElem.innerHTML = ''), 0 !== e.length))
          for (const t of e) {
            const e = t.node;
            if (e) {
              const t = await this.renderProductCard(e);
              this.productGridElem.innerHTML += t;
            }
          }
      }
      async renderProductCard(t) {
        const n = this.getStarRatingHtml(t),
          i = this.getProductImageHtml(t),
          {
            price: s,
            comparePrice: r,
            priceFromText: a,
          } = this.getPriceData(t);
        let o = '';
        if (t.metafield) {
          const e =
              '\n        query fetchNode($id: ID!) {\n          node(id: $id) {\n            ... on MediaImage {\n              image {\n                url\n                altText\n              }\n            }\n          } \n        }\n      ',
            n = { id: t.metafield.value };
          try {
            const { data: t, errors: i } =
              await this.storeFrontApiClient.request(e, { variables: n });
            if (i) throw new Error('Error fetching manufacture logo image!');
            o = this.getManufacturerLogoImageHtml(t.node.image);
          } catch (e) {}
        }
        const l =
          0 === s && 0 === r
            ? this.dataset.requestQuoteText
            : `${a}&nbsp;${e(s)}`;
        return `\n      <article class="product-card js-product-card">\n        <a class="anchor product-card__link" href="/products/${t.handle}">\n          <div class="product-card__image">\n            ${i}\n          </div>\n          <section class="product-card__body js-product-card__body">\n            <div class="product-card__main">\n              ${n}\n              <span class="text text--regular product-card__title js-product-card__title">\n                ${t.title}\n              </span>\n            </div>\n            <div class="product-card__price">\n              <span>\n                <div class="price-display">\n                  <div class="price-display__main">\n                    <span class="price price--regular ${r && s !== r ? 'price--with-compare' : ''} js-price--regular ot-block-price" aria-label="Preis">\n                      ${l}\n                    </span>\n                    ${r && s !== r ? `<span class="price price--compare js-price--compare ot-block-price" aria-label="Original price">\n                            ${e(r)}\n                          </span>` : ''}\n                  </div>\n                </div>\n              </span>\n            </div>\n            <div class="product-card__manufacturer-logo">\n              ${o}\n            </div>\n          </section>\n        </a>\n      </article>\n    `;
      }
      getStarRatingHtml(e) {
        const { rating: t, reviews: n } = e;
        if (!t || !n) return '';
        let i = '';
        for (let e = 0; e < 5; e++) {
          const n = e + 1;
          let s = 100;
          (n > t && (s = Math.round(Math.max(0, 100 - 100 * (n - t)))),
            (i += `\n        <div class="star-rating__star js-star-rating__star--${n}">\n          <div class="star-rating__star-body">\n            <span class="star-rating__star-icon star-rating__star-icon--empty"></span>\n          </div>\n          <div class="star-rating__star-body star-rating__star-body--filled js-star-rating__star-body--filled" style="width: ${s}%">\n            <span class="star-rating__star-body star-rating__star-body--filled js-star-rating__star-body--filled"></span>\n          </div>\n        </div>`));
        }
        return `\n      <div class="star-rating js-star-rating" role="img" aria-label="Rated ${t} out of 5 stars based on ${n} reviews">\n        <div class="star-rating__stars js-star-rating__stars">\n          ${i}\n        </div>\n        <span class="text text--regular star-rating__review js-star-rating__review text--center">(${n})</span>\n      </div>\n    `;
      }
      getProductImageHtml(e) {
        const t = e.featuredImage;
        return t &&
          t.url &&
          'undefined' !== t.url &&
          !String(t.url).includes('invalid url')
          ? `\n      <img\n        class="image js-product-card-image__img"\n        src="${t.url}"\n        alt="${t.altText ?? e.title}"\n      />\n    `
          : this.productPlaceholderImageElem?.innerHTML || '';
      }
      getManufacturerLogoImageHtml(e) {
        return e &&
          e.url &&
          'undefined' !== e.url &&
          !String(e.url).includes('invalid url')
          ? `\n      <img\n        class="image product-card-manufacturer-logo__image"\n        src="${e.url}"\n        alt="${e.altText ?? 'Manufacturer Logo'}"\n      />\n    `
          : '';
      }
      getPriceData(e) {
        return {
          price: Number(e.priceRange?.minVariantPrice?.amount),
          comparePrice: Number(e.compareAtPriceRange?.minVariantPrice?.amount),
          priceFromText: this.dataset.priceFromText.concat(' '),
        };
      }
      renderPagination(e) {
        e &&
          ((this.endCursor = e.endCursor),
          (this.hasNextPage = e.hasNextPage),
          (this.hasPreviousPage = e.hasPreviousPage),
          (this.startCursor = e.startCursor),
          this.updatePaginationButtons(),
          this.updateSearchUrl());
      }
      updateSearchUrl() {
        const e = new URL(window.location.href);
        (e.searchParams.set('after', this.endCursor),
          e.searchParams.set('before', this.startCursor),
          window.history.replaceState(null, '', e.toString()));
      }
      initFromSearchUrl(e = !1) {
        if (!e) return;
        const t = window.location.search,
          n = new URLSearchParams(t);
        'next' === this.paginationDirection
          ? (n.has('after')
              ? (this.after = n.get('after'))
              : (this.after = this.endCursor),
            (this.first = this.productsPerPage),
            (this.before = null),
            (this.last = null))
          : 'prev' === this.paginationDirection &&
            (n.has('before')
              ? (this.before = n.get('before'))
              : (this.before = this.startCursor),
            (this.last = this.productsPerPage),
            (this.after = null),
            (this.first = null));
      }
      updatePaginationButtons() {
        (this.prevPaginationBtn &&
          (this.hasPreviousPage
            ? this.prevPaginationBtn.classList.remove(
                'pagination-button--disabled',
              )
            : this.prevPaginationBtn.classList.add(
                'pagination-button--disabled',
              )),
          this.nextPaginationBtn &&
            (this.hasNextPage
              ? this.nextPaginationBtn.classList.remove(
                  'pagination-button--disabled',
                )
              : this.nextPaginationBtn.classList.add(
                  'pagination-button--disabled',
                )));
      }
      handlePrevPaginationBtnClick(e) {
        (e.preventDefault(),
          e.stopPropagation(),
          this.hasPreviousPage &&
            ((this.paginationDirection = 'prev'),
            this.initFromSearchUrl(!0),
            this.searchProducts(!0)));
      }
      handleNextPaginationBtnClick(e) {
        (e.preventDefault(),
          e.stopPropagation(),
          this.hasNextPage &&
            ((this.paginationDirection = 'next'),
            this.initFromSearchUrl(!0),
            this.searchProducts(!0)));
      }
    }
    customElements.get('collection-page') ||
      customElements.define('collection-page', t);
  })());
