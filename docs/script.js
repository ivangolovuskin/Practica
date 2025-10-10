document.addEventListener('DOMContentLoaded', () => {
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartItemsSubtotalElement = document.getElementById('cartItemsSubtotal');
    const footerCartSubtotalElement = document.getElementById('footerCartSubtotal');
    const footerDeliveryCostElement = document.getElementById('footerDeliveryCost');
    const footerCartTotalAmountElement = document.getElementById('footerCartTotalAmount');
    const checkoutBtnNew = document.getElementById('checkoutBtnNew');
    const cartBadge = document.querySelector('.cart-badge');

    const checkoutForm = document.getElementById('checkoutForm');
    const cartFormSeparator = document.querySelector('.cart-form-separator');
    const cartTotalsBlock = document.getElementById('cartTotalsBlock');
    const cartSubtotalInfoAboveForm = document.querySelector('.cart-subtotal-info');

    const customerPhoneInput = document.getElementById('customerPhone');
    if (customerPhoneInput) {
        customerPhoneInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) {
                value = value.substring(0, 11);
            }
            e.target.value = value;
        });
    }


    const emptyCartMessageHTML = '<p class="text-center text-muted empty-cart-message">Ваша корзина пуста.</p>';
    let cart = JSON.parse(localStorage.getItem('florinCartNew')) || [];

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const sortOrderSelect = document.getElementById('sortOrder');
    const productGrid = document.querySelector('.product-grid');
    let allProductItems = []; 

    if (productGrid) {
        allProductItems = Array.from(productGrid.querySelectorAll('.product-item'));
        allProductItems.forEach((item, index) => {
            item.dataset.originalIndex = index; 
            const priceText = item.querySelector('.product-price')?.textContent || '0 р.';
            item.dataset.priceValue = parseFloat(priceText.replace(/[^\d.-]/g, '')) || 0;
        });
    }

    function updateCartView() {
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = emptyCartMessageHTML;
            if (checkoutForm) checkoutForm.style.display = 'none';
            if (cartFormSeparator) cartFormSeparator.style.display = 'none';
            if (cartTotalsBlock) cartTotalsBlock.style.display = 'none';
            if (cartSubtotalInfoAboveForm) cartSubtotalInfoAboveForm.style.display = 'none';
            if (checkoutBtnNew) checkoutBtnNew.disabled = true;
        } else {
            cartItemsContainer.innerHTML = '';
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item-new');
                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-new-image">
                    <div class="cart-item-new-details">
                        <span class="cart-item-new-name">${item.name}</span>
                        <div class="cart-item-new-quantity">
                            <button class="btn btn-sm change-quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                            <span class="quantity-text mx-2">${item.quantity}</span>
                            <button class="btn btn-sm change-quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                        </div>
                    </div>
                    <span class="cart-item-new-price">${item.price * item.quantity} р.</span>
                    <button class="btn btn-remove-item-new" data-id="${item.id}">&times;</button>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
            if (checkoutForm) checkoutForm.style.display = 'block';
            if (cartFormSeparator) cartFormSeparator.style.display = 'block';
            if (cartTotalsBlock) cartTotalsBlock.style.display = 'block';
            if (cartSubtotalInfoAboveForm) cartSubtotalInfoAboveForm.style.display = 'block';
            if (checkoutBtnNew) checkoutBtnNew.disabled = false;
        }
        updateCartTotalsAndBadge();
        localStorage.setItem('florinCartNew', JSON.stringify(cart));
        attachCartItemEventListeners();
    }

    function updateCartTotalsAndBadge() {
        const itemsSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        if (cartItemsSubtotalElement) cartItemsSubtotalElement.textContent = itemsSubtotal;
        if (footerCartSubtotalElement) footerCartSubtotalElement.textContent = itemsSubtotal;

        const deliveryThreshold = 3500;
        const deliveryCostFixed = 300;
        let deliveryCost = 0;

        if (cart.length > 0 && itemsSubtotal < deliveryThreshold && itemsSubtotal > 0) {
            deliveryCost = deliveryCostFixed;
        }

        if (footerDeliveryCostElement) footerDeliveryCostElement.textContent = deliveryCost;

        const totalAmount = itemsSubtotal + deliveryCost;
        if (footerCartTotalAmountElement) footerCartTotalAmountElement.textContent = totalAmount;

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartBadge) {
            cartBadge.textContent = totalItems;
            cartBadge.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
    }

    function addItemToCart(id, name, price, image) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id, name, price: parseFloat(price), image, quantity: 1 });
        }
        updateCartView();
    }

    function handleCartItemAction(itemId, action) {
        const itemIndex = cart.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;

        if (action === 'increase') {
            cart[itemIndex].quantity++;
        } else if (action === 'decrease') {
            cart[itemIndex].quantity--;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
        } else if (action === 'remove') {
            cart.splice(itemIndex, 1);
        }
        updateCartView();
    }

    function attachProductEventListeners() {
        document.querySelectorAll('.product-item .btn-add-to-cart').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const id = e.target.dataset.id;
                const name = e.target.dataset.name;
                const price = e.target.dataset.price;
                const image = e.target.dataset.image;
                addItemToCart(id, name, price, image);
            });
        });
    }

    function attachCartItemEventListeners() {
        if (!cartItemsContainer) return;

        cartItemsContainer.querySelectorAll('.btn-remove-item-new').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', (e) => {
                const itemId = e.target.dataset.id;
                handleCartItemAction(itemId, 'remove');
            });
        });

        cartItemsContainer.querySelectorAll('.change-quantity-btn').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.id;
                const action = e.currentTarget.dataset.action;
                handleCartItemAction(itemId, action);
            });
        });
    }

    if (checkoutBtnNew) {
        checkoutBtnNew.addEventListener('click', () => {
            if (cart.length > 0) {
                 const customerNameInput = document.getElementById('customerName');
                const recipientTypeInput = document.querySelector('input[name="recipientType"]:checked');
                const deliveryDateInput = document.getElementById('deliveryDate');
                const deliveryTimeInput = document.getElementById('deliveryTime');
                const deliveryAddressInput = document.getElementById('deliveryAddress');
                const deliveryCommentInput = document.getElementById('deliveryComment');
                const paymentMethodInput = document.querySelector('input[name="paymentMethod"]:checked');

                if (!customerNameInput || !customerNameInput.value || !customerPhoneInput || !customerPhoneInput.value) {
                    alert('Пожалуйста, укажите ваше имя и номер телефона.');
                    return;
                }
                if (customerPhoneInput.value.length < 7 ) { 
                    alert('Пожалуйста, введите корректный номер телефона.');
                    return;
                }
                if (!recipientTypeInput || !paymentMethodInput) {
                    alert('Пожалуйста, выберите все обязательные опции.');
                    return;
                }
                let orderDetails = `--- Детали заказа ---\nИмя: ${customerNameInput.value}\nТелефон: ${customerPhoneInput.value}\nПолучатель: ${recipientTypeInput.value === 'self' ? 'Я' : 'Другой человек'}\nДата доставки: ${deliveryDateInput.value || 'Не указана'}\nВремя доставки: ${deliveryTimeInput.value || 'Не указано'}\nАдрес: ${deliveryAddressInput.value || 'Не указан'}\nКомментарий: ${deliveryCommentInput.value || 'Нет'}\nОплата: ${paymentMethodInput.value === 'online' ? 'Онлайн' : 'Наличными'}\n\nТовары:\n`;
                cart.forEach(item => {
                    orderDetails += `- ${item.name} x ${item.quantity} = ${item.price * item.quantity} р.\n`;
                });
                orderDetails += `\nСумма товаров: ${footerCartSubtotalElement.textContent} р.`;
                orderDetails += `\nДоставка: ${footerDeliveryCostElement.textContent} р.`;
                orderDetails += `\nИТОГО: ${footerCartTotalAmountElement.textContent} р.`;

                alert(`Демонстрация оформления заказа:\n${orderDetails}\n\nВаша корзина будет очищена.`);

                cart = [];
                updateCartView();
                if (checkoutForm) checkoutForm.reset();
                if (customerPhoneInput) customerPhoneInput.value = ''; 

                const cartModalEl = document.getElementById('cartModal');
                if (cartModalEl) {
                    const cartModalInstance = bootstrap.Modal.getInstance(cartModalEl);
                    if (cartModalInstance) {
                        cartModalInstance.hide();
                    }
                }

            } else {
                alert('Ваша корзина пуста.');
            }
        });
    }

    const filterButtons = document.querySelectorAll('.category-filter-btn');

    function displayProducts() {
        if (!productGrid || !allProductItems) return;

        const categoryFilter = document.querySelector('.category-filter-btn.active')?.dataset.filter || 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const sortValue = sortOrderSelect ? sortOrderSelect.value : 'default';

        let filteredProducts = allProductItems.filter(itemEl => {
            const itemCategory = itemEl.dataset.category;
            const categoryMatch = (categoryFilter === 'all' || itemCategory === categoryFilter);

            const productName = itemEl.querySelector('.product-name')?.textContent.toLowerCase() || '';
            const searchMatch = productName.includes(searchTerm);

            return categoryMatch && searchMatch;
        });
        
        let productsToSort = filteredProducts.map(el => {
            const price = parseFloat(el.dataset.priceValue) || 0;
            const name = el.querySelector('.product-name')?.textContent.toLowerCase() || '';
            const originalIndex = parseInt(el.dataset.originalIndex, 10);
            return { element: el, price, name, originalIndex };
        });

        productsToSort.sort((a, b) => {
            switch (sortValue) {
                case 'price_asc':
                    return a.price - b.price;
                case 'price_desc':
                    return b.price - a.price;
                case 'name_asc':
                    return a.name.localeCompare(b.name);
                case 'name_desc':
                    return b.name.localeCompare(a.name);
                case 'default':
                default:
                    return a.originalIndex - b.originalIndex;
            }
        });

        productGrid.innerHTML = '';
        if (productsToSort.length === 0) {
            productGrid.innerHTML = '<div class="col-12"><p class="text-center text-muted mt-4">Товары не найдены. Попробуйте изменить критерии поиска или фильтры.</p></div>';
        } else {
            productsToSort.forEach(item => {
                productGrid.appendChild(item.element);
            });
        }
        attachProductEventListeners();
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayProducts();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', displayProducts);
    }
    if (searchButton) { 
        searchButton.addEventListener('click', displayProducts);
    }
    if (sortOrderSelect) {
        sortOrderSelect.addEventListener('change', displayProducts);
    }

    updateCartView();
    if (productGrid) { 
        displayProducts(); 
    } else {
        attachProductEventListeners();
    }
});
