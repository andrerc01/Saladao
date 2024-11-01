const items = document.querySelectorAll(".item-box, .m-item-box");
const cartItemsContainer = document.getElementById("cart-items3");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");
const customerNameInput = document.getElementById("customer-name");
const commentsInput = document.getElementById("comments");

let cart = [];
let totalAmount = 0;

// Carregar o carrinho do localStorage ao iniciar
function loadCart() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
        totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    }
}

// Função para sanitizar entradas
function sanitizeInput(input) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = input; // Usa textContent para escapar qualquer código
    return tempDiv.innerHTML; // Retorna a versão sanitizada
}

// Função para formatar o preço em Reais
function formatPrice(value) {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

// Função para atualizar o modal do carrinho
function updateCartModal() {
    cartItemsContainer.innerHTML = ""; // Limpa o conteúdo atual
    const table = document.createElement("table");
    table.className = "cart-table"; // Adicione uma classe para estilizar a tabela

    // Cabeçalho da tabela
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
        <th>Produto</th>
        <th>Preço</th>
        <th>Quantidade</th>
        <th>Valor Total</th>
        <th>Ações</th>
    `;
    table.appendChild(headerRow);

    cart.forEach((item, index) => {
        const row = document.createElement("tr");
        const itemTotal = item.price * item.quantity; // Cálculo do valor total do item
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${formatPrice(item.price)}</td>
            <td>${item.quantity}</td>
            <td>${formatPrice(itemTotal)}</td>
            <td>
                <button class="button-quantity increase" data-index="${index}">Add +1</button>
                <button class="button-quantity decrease" data-index="${index}">Retirar -1</button>
            </td>
        `;
        table.appendChild(row);
    });

    // Adiciona a tabela ao container
    cartItemsContainer.appendChild(table);

    // Atualiza o total do carrinho
    cartTotal.innerText = formatPrice(totalAmount);
    cartCounter.innerText = cart.length;

    // Salvar o carrinho no localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Função para adicionar item ao carrinho
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    totalAmount += price;
}

// Evento de clique para adicionar itens ao carrinho
items.forEach(item => {
    item.addEventListener("click", function(e) {
        if (e.target.classList.contains("add-to-cart")) {
            const itemName = item.querySelector("h2, h3").innerText;
            const itemPriceText = item.querySelector(".price h3") ? 
                item.querySelector(".price h3").innerText : 
                item.querySelector(".m-item-price h3").innerText;

            // Extraindo e formatando o preço corretamente
            let itemPrice = parseFloat(itemPriceText.replace("A partir de ", "").replace("R$", "").replace(",", ".").trim());

            // Verifica se o itemPrice é um número válido
            if (!isNaN(itemPrice)) {
                addToCart(itemName, itemPrice);
                cartCounter.innerText = cart.length; // Atualiza a contagem do carrinho
                updateCartModal(); // Atualiza o modal do carrinho
            } else {
                console.error("Erro ao converter preço:", itemPriceText);
            }
        }
    });
});

// Abrir o modal do carrinho
cartBtn.addEventListener("click", function() {
    updateCartModal();
    cartModal.style.display = "flex";
});

// Fechar o modal do carrinho
closeModalBtn.addEventListener("click", function() {
    cartModal.style.display = "none";
});

// Aumentar a quantidade do item
cartItemsContainer.addEventListener("click", function(e) {
    if (e.target.classList.contains("increase")) {
        const index = e.target.getAttribute("data-index");
        cart[index].quantity++;
        totalAmount += cart[index].price;
        updateCartModal();
    }
    if (e.target.classList.contains("decrease")) {
        const index = e.target.getAttribute("data-index");
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
            totalAmount -= cart[index].price;
        } else {
            totalAmount -= cart[index].price;
            cart.splice(index, 1);
        }
        updateCartModal();
    }
});

// Defina o horário de abertura e fechamento (24 horas)
const openingHour = 19;  // 19:00 (7 PM)
const closingHour = 1;   // 01:00 (1 AM)

// Verificar se o restaurante está aberto
function checkRestaurantOpen() {
    const data = new Date();
    const hora = data.getHours();
    const diaSemana = data.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

    // O restaurante está fechado na segunda-feira (dia 1)
    if (diaSemana === 1) return false;

    if (closingHour > openingHour) {
        return hora >= openingHour && hora < closingHour;
    } else {
        return hora >= openingHour || hora < closingHour;
    }
}

// Manipular o card de horário
const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen();

if (isOpen) {
    spanItem.classList.remove("bg-red-500");
    spanItem.classList.add("bg-green-500");
} else {
    spanItem.classList.remove("bg-green-500");
    spanItem.classList.add("bg-red-500");
}

// Evento para finalizar pedido
checkoutBtn.addEventListener("click", function() {
    const customerName = sanitizeInput(customerNameInput.value.trim());
    const address = sanitizeInput(addressInput.value.trim());
    const comments = sanitizeInput(commentsInput.value.trim());

    if (customerName === "") {
        alert("Por favor, insira seu nome.");
        return;
    }

    if (address === "") {
        addressWarn.classList.remove("hidden");
    } else {
        addressWarn.classList.add("hidden");

        // Verifica se o restaurante está aberto
        const isOpen = checkRestaurantOpen();
        if (!isOpen) {
            alert("Ops! Estamos fechados no momento. Voltamos às 19:00! Esperamos você de terça a domingo!");
            return;
        }

        // Formatação para a mensagem do WhatsApp com quebras de linha e informações em negrito
        let orderDetails = cart.map(item => `*${item.name}* - ${formatPrice(item.price)} (QTD: ${item.quantity})`).join("\n");
        const messageToMerchant = `*Novo pedido:*\n*Nome:* ${customerName}\n*Endereço:* ${address}\n*Pedido:*\n${orderDetails}\n*Total:* ${formatPrice(totalAmount)}\n*Comentários:* ${comments}`;
        const phoneNumber = "5511997658875";
        const whatsappLink = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(messageToMerchant)}`;
        window.open(whatsappLink, "_blank");

        cart = [];
        totalAmount = 0;
        updateCartModal();
        cartModal.style.display = "none";
    }
});

// Fechar o modal do carrinho ao clicar fora dele
window.addEventListener("click", function(event) {
    if (event.target === cartModal) {
        cartModal.style.display = "none";
    }
});

// MENU
let menu = document.querySelector('.menu-icon');
let navbar = document.querySelector('.navbar');

menu.onclick = () => {
    menu.classList.toggle("move");
    navbar.classList.toggle("open-menu");
};

// Close menu on scroll
window.onscroll = () => {
    menu.classList.remove("move");
    navbar.classList.remove("open-menu");
};

// ScrollReveal
const animate = ScrollReveal({
    origin: "top",
    distance: "60px",
    duration: "300",
    delay: "0.5",
});

animate.reveal(".home-text", { origin: "left" });
animate.reveal(".home-img", { origin: "bottom" });
animate.reveal(".heading,.newsletter h2", { origin: "top" });
animate.reveal("header,.feature-box,.feature-menu-box,.item-box,.m-item-box,.t-box,.newaletter", { interval: 15 });

// Carregar o carrinho ao iniciar
loadCart();
updateCartModal();
