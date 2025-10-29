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
                { name: n, value: s, checked: i } = t;
              if (i) e.searchParams.append(n, s);
              else {
                const t = e.searchParams.getAll(n);
                (e.searchParams.delete(n),
                  t
                    .filter((e) => e !== s)
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
    'use strict';
    const e = (e) =>
        Number(e).toLocaleString('de-DE', {
          style: 'currency',
          currency: 'EUR',
        }),
      t = [{ keyword: 'Verkehrszeichen ', synonyms: ['VZ'] }];
    class n extends HTMLElement {
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
          (this.first = null),
          (this.last = null),
          (this.productGridElem = null),
          (this.searchResultsCountElems = []),
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
          this.searchProducts());
      }
      disconnectedCallback() {
        this.detachEventListeners();
      }
      cacheElements() {
        ((this.searchResultsCountElems = Array.from(
          this.querySelectorAll('.js-search-page-header__results'),
        )),
          (this.productGridElem = this.querySelector('.js-product-grid')),
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
      applyFilter(e = '') {
        let t = [];
        return (
          this.isValidFullSKU(e)
            ? (t = [
                ...t,
                {
                  productMetafield: {
                    key: 'sku',
                    namespace: 'custom',
                    value: String(e),
                  },
                },
              ])
            : ((t = [...t, { tag: 'search_show' }]),
              this.isValidSKU(e) &&
                (t = [
                  ...t,
                  {
                    productMetafield: {
                      key: 'sku',
                      namespace: 'custom',
                      value: String(e),
                    },
                  },
                ])),
          t
        );
      }
      applySynonyms(e = '') {
        if (!e) return '';
        let n = e;
        return (
          t.forEach((t) => {
            t.synonyms.forEach((s) => {
              e.indexOf(s) > -1 && (n = e.replace(s, t.keyword));
            });
          }),
          n
        );
      }
      async searchProducts() {
        if (!this.storeFrontApiClient) return;
        const e = window.location.search,
          t = new URLSearchParams(e);
        let n = '';
        (t.has('q') && (n = t.get('q')),
          this.initFromSearchUrl(),
          (this.after && 'null' !== this.after) || (this.after = null),
          (this.before && 'null' !== this.before) || (this.before = null));
        const s = this.applyFilter(n);
        let i = {
          query: `*${n}*`,
          after: this.after,
          before: this.before,
          first: this.first,
          last: this.last,
          productFilters: s,
        };
        if (this.isValidFullSKU(n) || this.isValidSKU(n))
          i = { ...i, query: '' };
        else {
          const e = this.applySynonyms(n);
          i = { ...i, query: `*${e}*` };
        }
        try {
          const { data: e, errors: t } = await this.storeFrontApiClient.request(
            '\n      query searchProducts(\n        $query: String!,\n        $after: String,\n        $before: String,\n        $first: Int,\n        $last: Int,\n        $productFilters: [ProductFilter!],\n      ) {\n        search(\n          query: $query,\n          after: $after,\n          before: $before,\n          first: $first,\n          last: $last,\n          types: PRODUCT,\n          productFilters: $productFilters\n        ) {\n          edges {\n            cursor\n            node {\n              ... on Product {\n                id\n                title\n                handle\n                description\n                tags\n                featuredImage {\n                  altText\n                  url\n                  width\n                  height\n                }\n                selectedOrFirstAvailableVariant {\n                  sku\n                }\n                priceRange {\n                  minVariantPrice {\n                    amount\n                    currencyCode\n                  }\n                  maxVariantPrice {\n                    amount\n                    currencyCode\n                  }\n                }\n                compareAtPriceRange {\n                  minVariantPrice {\n                    amount\n                    currencyCode\n                  }\n                  maxVariantPrice {\n                    amount\n                    currencyCode\n                  }\n                }\n              }\n            }\n          }\n          pageInfo {\n            endCursor\n            hasNextPage\n            hasPreviousPage\n            startCursor\n          }\n          totalCount\n        } \n      }\n    ',
            { variables: i },
          );
          if (t) throw new Error('Error searching products');
          (this.renderTotalCount(e.search.totalCount),
            this.renderSearchResults(e.search.edges),
            this.renderPagination(e.search.pageInfo));
        } catch (e) {}
      }
      renderTotalCount(e) {
        0 !== this.searchResultsCountElems.length &&
          this.searchResultsCountElems.forEach((t) => {
            t.innerText = this.dataset.resultsCount.replace('[count]', e);
          });
      }
      renderSearchResults(t) {
        ((this.productGridElem.innerHTML = ''),
          0 !== t.length &&
            t.forEach((t) => {
              const n = t.node;
              if (n) {
                let t = '';
                if (
                  (n.rating && '' !== n.rating) ||
                  (n.reviews && '' !== n.reviews)
                ) {
                  let e = '';
                  (Array.from({ length: 5 }, (t, s) => {
                    const i = s + 1;
                    let r = 100;
                    (i > n.rating &&
                      (r = Math.round(Math.max(0, 100 - 100 * (i - n.rating)))),
                      (e += `<div class="star-rating__star js-star-rating__star--${i}">\n              <div class="star-rating__star-body">\n                <span class="star-rating__star-icon star-rating__star-icon--empty"></span>\n              </div>\n              <div\n                class="star-rating__star-body star-rating__star-body--filled js-star-rating__star-body--filled"\n                style="width: ${r}%"\n              >\n                <span class="star-rating__star-body star-rating__star-body--filled js-star-rating__star-body--filled"></span>\n              </div>\n            </div>`));
                  }),
                    (t = `\n            <div\n              class="star-rating js-star-rating"\n              role="img"\n              aria-label="Rated ${n.rating} out of 5 stars based on ${n.reviews} reviews"\n            >\n              <div class="star-rating__stars js-star-rating__stars">\n                ${e}\n              </div>\n              <span class="text text--regular star-rating__review js-star-rating__review text--center">\n                (${n.reviews})\n              </span>\n            </div>\n          `));
                }
                const s = Number(n.priceRange?.minVariantPrice?.amount),
                  i = Number(n.compareAtPriceRange?.minVariantPrice?.amount);
                let r = `\n          <img\n            class="image js-product-card-image__img"\n            src="${n.featuredImage?.url}"\n            alt="${n.featuredImage?.altText ?? n.title}"\n          />\n        `;
                (!n.featuredImage ||
                  !n.featuredImage?.url ||
                  'undefined' === n.featuredImage?.url ||
                  String(n.featuredImage?.url).indexOf('invalid url') > -1) &&
                  this.productPlaceholderImageElem &&
                  (r = this.productPlaceholderImageElem.innerHTML);
                const o = `\n          <article class="product-card js-product-card">\n            <a class="anchor product-card__link" href="/products/${n.handle}">\n              <div class="product-card__image">\n                ${r}\n              </div>\n              <section class="product-card__body js-product-card__body">\n                <div class="product-card__main">\n                  ${t}\n                  <span class="text text--regular product-card__title js-product-card__title">\n                    ${n.title}\n                  </span>\n                </div>\n                <div class="product-card__price">\n                  <span>\n                    <div class="price-display">\n                      <div class="price-display__main">\n                        <span class="price price--regular ${i && !Number.isNaN(i) && s !== i ? 'price--with-compare' : ''} js-price--regular ot-block-price" aria-label="Preis">\n                          ${e(s)}\n                        </span>\n                        ${i && !Number.isNaN(i) && s !== i ? `\n                            <span class="price price--compare js-price--compare ot-block-price" aria-label="Original price">\n                              ${e(i)}\n                            </span>\n                          ` : ''}\n                      </div>\n                    </div>\n                  </span>\n                </div>\n              </section>\n            </a>\n          </article>\n        `;
                this.productGridElem.innerHTML += o;
              }
            }));
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
      initFromSearchUrl() {
        const e = window.location.search,
          t = new URLSearchParams(e);
        'next' === this.paginationDirection
          ? (t.has('after')
              ? (this.after = t.get('after'))
              : (this.after = this.endCursor),
            (this.first = this.productsPerPage),
            (this.before = null),
            (this.last = null))
          : 'prev' === this.paginationDirection &&
            (t.has('before')
              ? (this.before = t.get('before'))
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
            this.initFromSearchUrl(),
            this.searchProducts()));
      }
      handleNextPaginationBtnClick(e) {
        (e.preventDefault(),
          e.stopPropagation(),
          this.hasNextPage &&
            ((this.paginationDirection = 'next'),
            this.initFromSearchUrl(),
            this.searchProducts()));
      }
      isValidFullSKU(e) {
        return /^\d+-\d+$/.test(e);
      }
      isValidSKU(e) {
        return /^\d+$/.test(e);
      }
    }
    customElements.get('search-page') ||
      customElements.define('search-page', n);
  })());
