(function () {
  const registerForm = document.getElementById('create_customer');

  if (!registerForm) {
    return;
  }

  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(registerForm);
    const email = formData.get('email');

    await fetch('https://email-checker-2-aa4d308cb13d.herokuapp.com/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  });

  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        const customerTypeElem = document.querySelector(
          'select[name="abteilung_1"]',
        );
        if (customerTypeElem) {
          setTimeout(() => {
            toggleRequiredAttributes();
          }, 500);

          observer.disconnect();
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(registerForm, {
    attributes: true,
    childList: true,
    subtree: true,
  });
})();

const toggleRequiredAttributes = () => {
  const customerTypeElem = document.querySelector('select[name="abteilung_1"]');
  const vatIdElem = document.querySelector('input[name="umsatzsteuerid"]');

  let vatIdFormFieldElem = null;
  if (vatIdElem) {
    vatIdFormFieldElem = vatIdElem.closest('.cf-field.form-field');
  }

  if (customerTypeElem && vatIdElem && vatIdFormFieldElem) {
    customerTypeElem.addEventListener('change', function (e) {
      if (this.value === 'Gewerbe') {
        vatIdElem.required = true;
        vatIdElem.setAttribute('aria-required', true);
        vatIdFormFieldElem.setAttribute('data-cf-required', true);
      } else {
        vatIdElem.required = false;
        vatIdElem.setAttribute('aria-required', false);
        vatIdFormFieldElem.setAttribute('data-cf-required', false);
      }
    });
  }
};
