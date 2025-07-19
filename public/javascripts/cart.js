document.addEventListener("DOMContentLoaded", () => {
  // JavaScript to toggle the address field based on the selected option
  const deliveryOption = document.getElementById("delivery");
  const takeawayOption = document.getElementById("takeaway");
  const addressContainer = document.getElementById("address-container");

  // Event listener to show/hide address field
  deliveryOption.addEventListener("change", () => {
    if (deliveryOption.checked) {
      addressContainer.classList.remove("hidden");
    }
  });

  takeawayOption.addEventListener("change", () => {
    if (takeawayOption.checked) {
      addressContainer.classList.add("hidden");
    }
  });

  const cart = [];
  const cartElement = document.getElementById("cart");
  const placeOrderButton = document.getElementById("place-order");
  const orderConfirmation = document.getElementById("order-confirmation");

  function updateCart() {
    cartElement.innerHTML = "";
    cart.forEach((item) => {
      console.log(item);
      const cartItem = document.createElement("div");
      cartItem.className =
        "bg-gray-200 p-4 rounded-md flex justify-between items-center";
      cartItem.innerHTML = `
                <span class="font-semibold text-black">${item.name}</span>
                <span class="text-black">₹${item.price}</span>
                <button class="remove-item bg-red-500 text-white py-1 px-2 rounded-md hover:bg-red-600" data-id="${item.id}">Remove</button>
            `;
      cartElement.appendChild(cartItem);
    });

    placeOrderButton.style.display = cart.length > 0 ? "block" : "none";
  }

  document.querySelectorAll(".add-to-cart-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const foodId = formData.get("foodId");
      const foodName = form.closest(".p-4").querySelector("h3").textContent;
      const foodPrice = form.closest(".p-4").querySelector("span").textContent;

      cart.push({ id: foodId, name: foodName, price: foodPrice });
      updateCart();
    });
  });

  cartElement.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-item")) {
      const id = e.target.getAttribute("data-id");
      const index = cart.findIndex((item) => item.id === id);
      if (index !== -1) {
        cart.splice(index, 1);
        updateCart();
      }
    }
  });

  // Razorpay integration
  placeOrderButton.addEventListener("click", async () => {
    const amount = cart.reduce(
      (total, item) => total + parseFloat(item.price),
      0
    ); // Calculate the total amount

    const response = await fetch("/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const data = await response.json();

    if (!data.success) {
      alert("Order creation failed!");
      return;
    }

    const options = {
      key: "rzp_test_UPsGxPIGbJpyfG",
      amount: data.amount,
      currency: "INR",
      name: "Big Bites",
      description: "Test Transaction",
      image: "/images/bg.jpg",
      order_id: data.orderId,
      handler: async function (response) {
        await verifyPayment(response);
      },
      prefill: {
        name: "<%= user.name %>",
        email: "<%= user.email %>",
        contact: "9999999999",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const razorpay = new Razorpay(options);
    razorpay.open();

    razorpay.on("payment.failed", function (response) {
      window.location.href = "/order-statusf";
    });
  });

  // Function to verify payment on the backend
  async function verifyPayment(paymentResponse) {
    const response = await fetch("/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentResponse),
    });

    const data = await response.json();
    if (data.success) {
      cart.length = 0; 
      updateCart();
      window.location.href = "/order-statusg";
      orderConfirmation.classList.remove("hidden");
      setTimeout(() => orderConfirmation.classList.add("hidden"), 3000);
    } else {
      window.location.href = "/order-statusf";
    }
  }
});
