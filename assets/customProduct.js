const storeDomain = 'https://kommondo.myshopify.com';
const publicAccessToken = '8b9355555e1431ae5ed59843aa9424ff';
const apiVersion = '2025-01';
class VariantGroup extends HTMLElement {
  #storeFrontApiClient = null;

  constructor() {
    super();
    this.variantId = this.dataset.id; // Unused variable
    this.variantGroup = this.querySelector('.js-variant-group');
    this.variantSku = this.dataset.sku;
    this.skuPrefix = this.variantSku.split('-')[0];
    this.templates = {
      variantRow: document.getElementById('variant-row-template'),
      buttonGroup: document.getElementById('button-group-template'),
      optionButton: document.getElementById('option-variant-button-template'),
    };
    this.selectedValues = {};
    this.productTitle = document.querySelector('.js-product-title');
    this.priceDisplay = document.querySelector('.js-price-display'); // Unused variable
    this.currentSku = this.variantSku; // Save the currently selected SKU
    this.currentDisabledSku = null;
    this.priceFromText = '';
  }

  async connectedCallback() {
    this.variants = await this.fetchVariantGroup();
    if (!this.variants) return;

    if (ShopifyStorefrontAPIClient) {
      this.#storeFrontApiClient =
        ShopifyStorefrontAPIClient.createStorefrontApiClient({
          storeDomain,
          apiVersion,
          publicAccessToken,
        });
    }

    this.renderVariantGroups();
    this.determinePriceFromText();
    this.updatePriceFromText();
    this.updateATCVisibility(this.currentSku);
  }

  async fetchVariantGroup() {
    try {
      const response = await fetch(
        `/apps/variants-grouper/find-group/${this.skuPrefix}`,
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error fetching variant group:', error);
    }

    return null;
  }

  renderVariantGroups() {
    const optionsWithValues = this.extractUniqueOptions(this.variants);
    this.variantGroup.innerHTML = '';

    // Find the current variant to get its selected values
    const currentVariant = this.variants.find((v) => v.sku === this.currentSku);
    if (currentVariant) {
      const attributes = this.getValidAttributes(currentVariant);
      attributes.forEach((attr) => {
        this.selectedValues[attr.name] = attr.value;
      });
    }

    // Pre-select single value options
    Object.entries(optionsWithValues).forEach(([optionName, values]) => {
      if (values.length === 1) {
        this.selectedValues[optionName] = values[0];
      }
    });

    // Only render options with multiple values
    Object.entries(optionsWithValues).forEach(([optionName, values], index) => {
      if (values.length > 1) {
        const variantRow = this.createVariantRow(optionName, values, index);
        this.variantGroup.appendChild(variantRow);
      }
    });
  }

  updateATCVisibility(sku) {
    if (!sku) return;

    let isMasterProduct = true;
    if (/-/.test(sku)) {
      isMasterProduct = false;
    }

    const atcSubmitButton = document.querySelector('.js-add-to-cart__button');
    if (!atcSubmitButton) return;

    if (this.variants.length <= 1) {
      atcSubmitButton.removeAttribute('disabled');
    } else {
      if (isMasterProduct) {
        atcSubmitButton.setAttribute('disabled', '');
      } else {
        atcSubmitButton.removeAttribute('disabled');
      }
    }
  }

  determinePriceFromText() {
    if (!this.variants || this.variants.length === 0) return '';

    const prices = this.variants
      .map((product) => parseFloat(product.price))
      .filter((price) => price > 0);

    const uniquePrices = [...new Set(prices)];

    const hasMultiplePrices = uniquePrices.length > 1;
    if (hasMultiplePrices) {
      this.priceFromText = this.dataset.priceFromText.concat(' ');
    }
  }

  updatePriceFromText() {
    const productWithLowestPrice = this.variants
      .filter((product) => parseFloat(product.price) > 0)
      .reduce((minProduct, currentProduct) => {
        return parseFloat(currentProduct.price) < parseFloat(minProduct.price)
          ? currentProduct
          : minProduct;
      });

    if (!productWithLowestPrice) return;

    if (Object.keys(this.selectedValues).length === 0) {
      this.updatePriceDisplay(productWithLowestPrice);
    }

    this.priceFromText = '';
  }

  createVariantRow(optionName, values, index) {
    const row = this.templates.variantRow.content.cloneNode(true);

    // Set option name
    row.querySelector('.variant-row__title').textContent = optionName;

    // Set up button group
    const buttonGroup = row.querySelector('.button-group');
    buttonGroup.id = `group_${index + 1}`;

    let arrayType = 'string';
    let isNumbericArray = true;
    values.forEach((value) => {
      const valueSplitted = value.split('-');
      if (valueSplitted.length >= 2) {
        const firstPart = valueSplitted[0];
        if (!isNaN(firstPart) && !isNaN(parseFloat(firstPart))) {
          arrayType = 'range_number';
          isNumbericArray = false;
        }
      } else {
        if (!isNaN(value) && !isNaN(parseFloat(value))) {
          isNumbericArray = true;
        } else {
          isNumbericArray = false;
        }
      }
    });

    if (isNumbericArray && arrayType === 'string') {
      arrayType = 'pure_number';
    }

    if (arrayType === 'range_number') {
      values.sort((a, b) => {
        const numA = parseInt(a.split('-')[0]);
        const numB = parseInt(b.split('-')[0]);
        return numA - numB;
      });
    } else if (arrayType === 'pure_number') {
      values.sort((a, b) => a - b);
    } else {
      values.sort();
    }

    const currentDisabledVariant = this.variants.find(
      (v) => v.sku === this.currentDisabledSku,
    );

    // Add option buttons
    values.forEach((value, buttonIndex) => {
      let isSelected = this.selectedValues[optionName] === value;
      let shouldDisable =
        !isSelected && this.shouldDisableOption(optionName, value);

      if (currentDisabledVariant) {
        const attributes = this.getValidAttributes(currentDisabledVariant);
        shouldDisable = attributes.some(
          (attr) => attr.name === optionName && attr.value === value,
        );
      }

      const button = this.createOptionButton(
        value,
        buttonIndex,
        isSelected,
        optionName,
        shouldDisable,
      );
      buttonGroup.appendChild(button);
    });

    return row;
  }

  shouldDisableOption(optionName, optionValue) {
    // Get all variants except the current one
    const otherVariants = this.variants.filter(
      (variant) => variant.sku !== this.currentSku,
    );

    // Check if any other variant has this option value
    return !otherVariants.some((variant) => {
      const attributes = this.getValidAttributes(variant);
      return attributes.some(
        (attr) => attr.name === optionName && attr.value === optionValue,
      );
    });
  }

  createOptionButton(value, index, isSelected, optionName, isDisabled) {
    const button = this.templates.optionButton.content.cloneNode(true);
    const buttonElement = button.querySelector('button');
    buttonElement.id = `button_${index + 1}`;
    const buttonText = buttonElement.querySelector('.button__text');
    buttonText.textContent = value;

    if (isSelected) {
      buttonElement.classList.remove('button--outlined');
      buttonElement.classList.add('button--solid');
    }

    if (isDisabled) {
      buttonElement.disabled = true;
      buttonElement.classList.add('button--disabled');
    }

    buttonElement.addEventListener('click', () =>
      this.handleOptionClick(optionName, value),
    );

    return button;
  }

  handleOptionClick(optionName, value) {
    // Update selected values
    this.selectedValues[optionName] = value;

    // Find matching variant
    let matchingVariant = this.variants.find((variant) => {
      const attributes = this.getValidAttributes(variant);
      if (attributes.length === 0) return false;

      return attributes.every(
        (attr) => this.selectedValues[attr.name] === attr.value,
      );
    });

    // If no matching variant found, find a variant that has the clicked option value
    if (!matchingVariant) {
      const variantsWithClickedOption = this.variants.filter((variant) => {
        const attributes = this.getValidAttributes(variant);
        return attributes.some(
          (attr) => attr.name === optionName && attr.value === value,
        );
      });

      if (variantsWithClickedOption.length > 0) {
        // Select the first variant that has the clicked option value
        matchingVariant = variantsWithClickedOption[0];

        // Update selected values to match the new variant
        const newAttributes = this.getValidAttributes(matchingVariant);
        newAttributes.forEach((attr) => {
          this.selectedValues[attr.name] = attr.value;
        });
      }
    }

    if (matchingVariant) {
      if (matchingVariant.status !== 'ACTIVE') {
        this.currentDisabledSku = matchingVariant.sku;
        this.renderVariantGroups();
        return;
      }

      this.currentDisabledSku = null;
      this.currentSku = matchingVariant.sku; // Update the current SKU
      this.productTitle.textContent = matchingVariant.productTitle;
      this.updatePriceDisplay(matchingVariant);
      this.updateSku(matchingVariant);
      this.updateProductGallery(matchingVariant.images);
      this.updateProductHandle(matchingVariant);
      this.updateProductForm(matchingVariant);
      this.updateVisibilityForPrice(matchingVariant.price);
      this.updateSummaryPrices(matchingVariant.price);
      this.updateProductDetails(matchingVariant.handle);
      this.renderVariantGroups(); // Re-render variant groups
      this.updateATCVisibility(this.currentSku);
    }
  }

  extractUniqueOptions(variants) {
    return variants.reduce((optionMap, variant) => {
      const attributes = this.getValidAttributes(variant);
      this.addAttributesToMap(attributes, optionMap);
      return optionMap;
    }, {});
  }

  getValidAttributes(variant) {
    return Object.values(variant.attributes);
  }

  addAttributesToMap(attributes, optionMap) {
    attributes.forEach(({ name, value }) => {
      if (!optionMap[name]) {
        optionMap[name] = [value];
      } else if (!optionMap[name].includes(value)) {
        optionMap[name].push(value);
      }
    });
  }

  updatePriceDisplay(variant) {
    // Get templates
    const priceDisplayTemplate = document.getElementById(
      'price-display-template',
    );
    const priceTemplate = document.getElementById('price-template');
    const comparePriceTemplate = document.getElementById(
      'compare-price-template',
    );
    const discountBadgeTemplate = document.getElementById(
      'discount-badge-template',
    );
    const priceDescriptionTemplate = document.getElementById(
      'price-description-template',
    );

    // Create new price display
    const newPriceDisplay =
      priceDisplayTemplate.content.cloneNode(true).firstElementChild; // Get the actual element, not DocumentFragment
    const priceDisplayMain = newPriceDisplay.querySelector(
      '.price-display__main',
    );

    // Add regular price
    const priceElement =
      priceTemplate.content.cloneNode(true).firstElementChild; // Get the actual element

    if (Number(variant.price) === 0) {
      priceElement.textContent = 'Preis auf Anfrage';
      priceDisplayMain.appendChild(priceElement);
    } else {
      const formattedPrice = this.formatMoney(variant.price);
      priceElement.textContent = this.priceFromText + formattedPrice;

      const priceDescriptionElement =
        priceDescriptionTemplate.content.cloneNode(true).firstElementChild;

      if (variant.compareAtPrice && variant.compareAtPrice > variant.price) {
        priceElement.classList.add('price--with-compare');

        // Add compare at price
        const compareAtPriceElement =
          comparePriceTemplate.content.cloneNode(true).firstElementChild;
        const formattedComparePrice = this.formatMoney(variant.compareAtPrice);
        compareAtPriceElement.textContent = formattedComparePrice;

        // Add discount badge
        const discountElement =
          discountBadgeTemplate.content.cloneNode(true).firstElementChild;
        const discountRate = Math.round(
          ((variant.compareAtPrice - variant.price) * 100) /
            variant.compareAtPrice,
        );
        discountElement.textContent = `-${discountRate}%`;

        priceDisplayMain.appendChild(priceElement);
        priceDisplayMain.appendChild(compareAtPriceElement);
        priceDisplayMain.appendChild(discountElement);
        newPriceDisplay.appendChild(priceDescriptionElement);
      } else {
        priceDisplayMain.appendChild(priceElement);
        newPriceDisplay.appendChild(priceDescriptionElement);
      }
    }

    // Replace old price display with new one
    const currentPriceDisplay = document.querySelector(
      '.product-info__top .price-display',
    );
    if (currentPriceDisplay) {
      currentPriceDisplay.replaceWith(newPriceDisplay);
    }
  }

  formatMoney(euros) {
    return Number(euros).toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR',
    });
  }

  updateSku(variant) {
    const skuElement = document.querySelector('.product-number dd');
    if (skuElement && variant) {
      skuElement.textContent = variant.sku || 'N/A';
    }
  }

  updateProductGallery(variantImages) {
    // Get templates
    const galleryTemplate = document.getElementById('product-gallery-template');
    const mainSlideTemplate = document.getElementById(
      'gallery-main-slide-template',
    );
    const thumbSlideTemplate = document.getElementById(
      'gallery-thumb-slide-template',
    );
    const placeholderTemplate = document.getElementById(
      'gallery-placeholder-template',
    );

    // Get current gallery
    const currentGallery = document.querySelector('product-gallery');
    if (!currentGallery) return;

    // Create new gallery
    const newGallery = galleryTemplate.content.cloneNode(true);
    const mainWrapper = newGallery.querySelector(
      '.js-swiper--main .swiper-wrapper',
    );
    const thumbWrapper = newGallery.querySelector(
      '.js-swiper--thumb .swiper-wrapper',
    );

    if (!variantImages || variantImages.length === 0) {
      // Add placeholder if no images
      const placeholder = placeholderTemplate.content.cloneNode(true);
      mainWrapper.appendChild(placeholder);
      thumbWrapper.appendChild(placeholder.cloneNode(true));
    } else {
      // Add images
      variantImages.forEach((image, index) => {
        // Create main slide
        const mainSlide = mainSlideTemplate.content.cloneNode(true);
        const mainImg = mainSlide.querySelector('img');
        mainImg.src = `${image.url}?width=560`;
        mainImg.alt = image.altText || '';
        mainWrapper.appendChild(mainSlide);

        // Create thumb slide
        const thumbSlide = thumbSlideTemplate.content.cloneNode(true);
        const thumbImg = thumbSlide.querySelector('img');
        const thumbSlideDiv = thumbSlide.querySelector('.swiper-slide');

        thumbImg.src = `${image.url}?width=78`;
        thumbImg.alt = image.altText || '';
        thumbSlideDiv.setAttribute(
          'aria-label',
          `${index + 1} / ${variantImages.length}`,
        );
        thumbSlideDiv.setAttribute('data-swiper-slide-index', index);

        if (index === 0) {
          thumbSlideDiv.classList.add(
            'swiper-slide-active',
            'swiper-slide-thumb-active',
          );
        }

        thumbWrapper.appendChild(thumbSlide);
      });
    }

    // Replace old gallery with new one
    currentGallery.replaceWith(newGallery);

    // Reinitialize Swiper instances if needed
    if (window.mainSwiper) {
      window.mainSwiper.update();
    }
    if (window.thumbSwiper) {
      window.thumbSwiper.update();
    }
  }

  updateProductHandle(variantData) {
    if (!variantData || !variantData.handle) return;

    // Update the URL without reloading the page
    const newUrl = `/products/${variantData.handle}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
  }

  updateProductForm(variantData) {
    if (!variantData || !variantData.productId) return;

    // Find the add to cart form
    const form = document.querySelector('form[action="/cart/add"]');
    if (!form) return;

    // Update the product id input
    const productIdInput = form.querySelector('input[name="product-id"]');
    if (productIdInput) {
      productIdInput.value = variantData.productId.replace(
        'gid://shopify/Product/',
        '',
      );
    }

    // Update the variant id input
    const variantIdInput = form.querySelector('input[name="id"]');
    if (variantIdInput) {
      variantIdInput.value = variantData.variantId.replace(
        'gid://shopify/ProductVariant/',
        '',
      );
    }
  }

  updateVisibilityForPrice(price) {
    const summary = document.querySelector('.summary');
    const addToCartButton = document.querySelector('.add-to-cart__atc-form');

    if (!summary || !addToCartButton) return;

    if (Number(price) === 0) {
      summary.classList.add('hidden');
      addToCartButton.classList.add('hidden');
    } else {
      summary.classList.remove('hidden');
      addToCartButton.classList.remove('hidden');
    }
  }

  updateSummaryPrices(price) {
    const qrCheckbox = document.querySelector(
      '.gpo-choicelist.gpo-checkbox input[type="checkbox"]',
    );
    const qrCodePrice = document.querySelector('.js-summary-product-qr-code');
    const totalPrice = document.querySelector('.js-summary-product-total');
    const subtotalPrice = document.querySelector(
      '.js-summary-product-subtotal',
    );
    const quantity = document.querySelector('.js-summary-product-quantity');
    const productPrice = document.querySelector('.js-summary-product-price');

    if (!subtotalPrice || !totalPrice || !productPrice) return;

    const formattedPrice = this.formatMoney(price);
    productPrice.textContent = formattedPrice;

    const quantityValue = quantity
      ? parseInt(quantity.textContent.replace('x', ''))
      : 1;
    const subtotal = price * quantityValue;
    subtotalPrice.textContent = this.formatMoney(subtotal);

    let total = subtotal;
    if (qrCheckbox && qrCheckbox.checked && qrCodePrice) {
      total += 275; // 2.75€ in cents
    }

    totalPrice.textContent = this.formatMoney(total);
  }

  async updateProductDetails(productHandle) {
    const shippingInfoRowAvailableElem = document.querySelector(
      '.js-shipping-info-row--available',
    );
    const shippingInfoRowUnavailableElem = document.querySelector(
      '.js-shipping-info-row--unavailable',
    );

    if (!shippingInfoRowAvailableElem || !shippingInfoRowUnavailableElem)
      return;

    if (!this.#storeFrontApiClient) return;

    const productQuery = `
      query fetchProduct(
        $handle: String!,
        $identifiers: [HasMetafieldsIdentifier!]!
      ) {
        product(handle: $handle) {
          title
          handle
          id
          availableForSale
          description
          descriptionHtml
          metafields(identifiers: $identifiers) {
            namespace
            description
            key
            value
          }
        } 
      }
    `;

    const variables = {
      handle: productHandle,
      identifiers: [
        {
          key: 'details_features',
          namespace: 'custom',
        },
        {
          key: 'details_reviews',
          namespace: 'custom',
        },
      ],
    };

    try {
      const { data, errors } = await this.#storeFrontApiClient.request(
        productQuery,
        { variables },
      );

      if (errors) {
        throw new Error('Network response was not ok');
      }

      const { availableForSale, descriptionHtml, metafields } = data.product;

      // description ...
      const descriptionWrapper = document.querySelector(
        '.js-accordion-item--description',
      );
      const descriptionElem = document.querySelector(
        '.js-accordion-item__content--description',
      );
      if (descriptionWrapper && descriptionElem) {
        descriptionElem.innerHTML = descriptionHtml;

        descriptionWrapper.classList.remove('visually-hidden');
      }

      // features ...
      const featuresWrapper = document.querySelector(
        '.js-accordion-item--features',
      );
      const featuresElem = document.querySelector(
        '.js-accordion-item__content--features',
      );
      if (featuresWrapper && featuresElem) {
        if (metafields[0] && metafields[0].key === 'details_features') {
          const obj = JSON.parse(metafields[0].value);
          const textValue = obj.children[0].children[0].value;
          featuresElem.innerHTML = textValue;

          featuresWrapper.classList.remove('visually-hidden');
        } else {
          featuresElem.innerHTML = '';

          featuresWrapper.classList.add('visually-hidden');
        }
      }

      // reviews ...
      const reviewsWrapper = document.querySelector(
        '.js-accordion-item--reviews',
      );
      const reviewsElem = document.querySelector(
        '.js-accordion-item__content--reviews',
      );
      if (reviewsWrapper && reviewsElem) {
        if (metafields[1] && metafields[1].key === 'details_reviews') {
          const obj = JSON.parse(metafields[1].value);
          const textValue = obj.children[0].children[0].value;
          reviewsElem.innerHTML = textValue;

          reviewsWrapper.classList.remove('visually-hidden');
        } else {
          reviewsElem.innerHTML = '';

          reviewsWrapper.classList.add('visually-hidden');
        }
      }

      if (availableForSale) {
        shippingInfoRowAvailableElem.classList.remove(
          'shipping-info-row--hidden',
        );
        shippingInfoRowUnavailableElem.classList.add(
          'shipping-info-row--hidden',
        );
      } else {
        shippingInfoRowUnavailableElem.classList.remove(
          'shipping-info-row--hidden',
        );
        shippingInfoRowAvailableElem.classList.add('shipping-info-row--hidden');
      }
    } catch (error) {
      console.error('Error fetching product information:', error);
    }
  }
}

if (!customElements.get('variant-group')) {
  customElements.define('variant-group', VariantGroup);
}

function initQrCodeCheckboxListener() {
  // Use MutationObserver to detect when the checkbox is added to the DOM
  const callback = (mutations, observer) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        setTimeout(() => {
          const qrCheckbox = document.querySelector(
            '.gpo-choicelist.gpo-checkbox input[type="checkbox"]',
          );
          if (qrCheckbox) {
            qrCheckbox.addEventListener('change', (event) => {
              const priceElem = document.querySelector(
                '.js-summary-product-price',
              );
              const qrCodePrice = document.querySelector(
                '.js-summary-product-qr-code',
              );
              const totalPrice = document.querySelector(
                '.js-summary-product-total',
              );
              const subtotalPrice = document.querySelector(
                '.js-summary-product-subtotal',
              );
              const quantity = document.querySelector('.js-quantity-input');

              const price = Number(
                priceElem.textContent.replace('€', '').trim().replace(',', '.'),
              );

              let subtotal = price * quantity.value;
              if (event.target.checked) {
                qrCodePrice.textContent = '2,75 €';

                subtotal = (price + 2.75) * quantity.value;
              } else {
                qrCodePrice.textContent = '0,00 €';
              }

              subtotalPrice.textContent = `${subtotal.toFixed(2).replace('.', ',')} €`;
              totalPrice.textContent = subtotalPrice.textContent;
            });
            // Disconnect the observer once we've found and set up the checkbox
            observer.disconnect();
          }
        }, 500);
      }
    });
  };

  const targetNode = document.querySelector('.product-info__bottom');
  if (!targetNode) return;

  // Start observing
  const observer = new MutationObserver(callback);
  observer.observe(targetNode, {
    attributes: true,
    childList: true,
    subtree: true,
  });
}

// Call this function when your code initializes
initQrCodeCheckboxListener();
