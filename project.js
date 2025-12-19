// ===== Smooth Scroll =====
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const id = link.getAttribute('href').substring(1);
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  });
});

// ===== CART LOGIC =====
const addButtons = document.querySelectorAll('.add-to-cart');
const cartModal = document.getElementById('cart-modal');
const cartTableBody = document.querySelector('#cart-table tbody');
const cartCount = document.querySelector('.cart-count');
const closeCart = document.getElementById('close-cart');
const cartTotal = document.getElementById('cart-total');
let cart = [];

addButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.gadget-card');
    const name = card.querySelector('h3').textContent;
    const price = parseInt(card.dataset.price);

    const existing = cart.find(item => item.name === name);
    if (existing) {
      alert(`${name} is already in your cart.`);
      return;
    }

    // Add new item to cart
    cart.push({ name, price, qty: 1 });
    updateCart();

    // Change button style and text
    btn.textContent = "ADDED ✓";
    btn.classList.add("added");
  });
});


function updateCart() {
  cartTableBody.innerHTML = '';
  let total = 0;
  cart.forEach((item, i) => {
    total += item.price * item.qty;
    cartTableBody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${item.name}</td>
        <td>$${item.price}</td>
        <td>
          <button onclick="changeQty(${i}, -1)">-</button>
          ${item.qty}
          <button onclick="changeQty(${i}, 1)">+</button>
        </td>
        <td><button onclick="removeItem(${i})">Remove</button></td>
      </tr>`;
  });
  cartTotal.textContent = total;
  cartCount.textContent = cart.length;
}

// Quantity change
function changeQty(index, change) {
  const item = cart[index];
  if (item.qty + change < 1) {
    alert("You can’t have less than one item!");
    return;
  }
  item.qty += change;
  updateCart();
}

// Remove
function removeItem(index) {
  cart.splice(index, 1);
  // Reset the button when item is removed
const button = [...addButtons].find(b => 
  b.closest('.gadget-card').querySelector('h3').textContent === cart[index]?.name
);
if (button) {
  button.textContent = "ADD TO CART";
  button.classList.remove("added");
}

  updateCart();
}

// ===== OPEN/CLOSE CART =====
document.querySelector('.cart').addEventListener('click', () => {
  cartModal.classList.remove('hidden');
});
closeCart.addEventListener('click', () => {
  cartModal.classList.add('hidden');
});
// ===== CHECKOUT FORM LOGIC =====
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const cancelCheckout = document.getElementById('cancel-checkout');
const checkoutForm = document.getElementById('checkout-form');

checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Your cart is empty. Please add some items first.');
    return;
  }
  checkoutModal.classList.remove('hidden');
  cartModal.classList.add('hidden');
});

cancelCheckout.addEventListener('click', () => {
  checkoutModal.classList.add('hidden');
});

checkoutForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();

  if (name === '' || email === '' || phone === '') {
    alert('Please fill in all fields.');
    return;
  }
  if (isNaN(phone) || phone.length < 11) {
    alert('Phone number must be numeric and at least 11 digits.');
    return;
  }

alert(`Redirecting ${name} to Paystack for payment...`);
const totalAmount = parseInt(cartTotal.textContent);
payWithPaystack(name, email, totalAmount);

  checkoutForm.reset();
  checkoutModal.classList.add('hidden');
  cart = [];
  updateCart();
});
function payWithPaystack(name, email, amount) {
  let handler = PaystackPop.setup({
    key: 'pk_test_9e29c0ac6a5e7674b79dd6a473451e0ec544d621', // your TEST public key
    email: email,
    amount: amount * 100, // Paystack expects kobo, so multiply by 100
    currency: 'NGN',
    ref: 'EMS_' + Math.floor((Math.random() * 1000000000) + 1),
    metadata: {
      custom_fields: [
        {
          display_name: name,
          variable_name: "customer_name",
          value: name
        }
      ]
    },
    callback: function (response) {
      alert('Payment complete! Reference: ' + response.reference);
      cart = [];
      updateCart();
    },
    onClose: function () {
      alert('Transaction was not completed, window closed.');
    }
  });
  handler.openIframe();
}

