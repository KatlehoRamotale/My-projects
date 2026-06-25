const HOTEL_ROOMS = [
    { type: "Single", number: "101", price: 500, image: "images/singleroom.png" },
    { type: "Single", number: "102", price: 500, image: "images/singleroom2.png" },
    { type: "Double", number: "201", price: 800, image: "images/doubleroom.png" },
    { type: "Double", number: "202", price: 800, image: "images/doubleroom2.png" },
    { type: "Suite", number: "301", price: 1500, image: "images/suiteroom.png" },
    { type: "VIP1", number: "404", price: 1300, image: "images/vip.png" },
    { type: "VIP2", number: "505", price: 2200, image: "images/suiteroom2.png" }
];


/* =========================
   STORAGE HELPERS
========================= */
function getUsers() {
    return JSON.parse(localStorage.getItem("hotelUsers")) || [];
}

function saveUsers(users) {
    localStorage.setItem("hotelUsers", JSON.stringify(users));
}

function getBookings() {
    return JSON.parse(localStorage.getItem("hotelBookings")) || [];
}

function saveBookings(bookings) {
    localStorage.setItem("hotelBookings", JSON.stringify(bookings));
}

function getLoggedInUser() {
    return JSON.parse(localStorage.getItem("loggedInHotelUser")) ||
           JSON.parse(sessionStorage.getItem("loggedInHotelUser"));
}

function getRoomByNumber(roomNumber) {
    return HOTEL_ROOMS.find(room => room.number === roomNumber);
}

function getRoomCardClass(roomType) {
    if (roomType === "Single") return "single-room";
    if (roomType === "Double") return "double-room";
    if (roomType === "Suite") return "suite-room";
    return "";
}

function getBookingCardClass(roomType) {
    if (roomType === "Single") return "single-booking";
    if (roomType === "Double") return "double-booking";
    if (roomType === "Suite") return "suite-booking";
    return "";
}

/* =========================
   LOGIN ATTEMPT LOCKOUT
========================= */
function getLoginAttempts() {
    return JSON.parse(localStorage.getItem("hotelLoginAttempts")) || {};
}

function saveLoginAttempts(attempts) {
    localStorage.setItem("hotelLoginAttempts", JSON.stringify(attempts));
}

function getRemainingLockTime(username) {
    const attempts = getLoginAttempts();
    const userRecord = attempts[username];

    if (!userRecord || !userRecord.lockUntil) {
        return 0;
    }

    const remaining = Math.ceil((userRecord.lockUntil - Date.now()) / 1000);

    if (remaining <= 0) {
        delete attempts[username];
        saveLoginAttempts(attempts);
        return 0;
    }

    return remaining;
}

function registerFailedAttempt(username) {
    const attempts = getLoginAttempts();

    if (!attempts[username]) {
        attempts[username] = {
            count: 0,
            lockUntil: null
        };
    }

    attempts[username].count += 1;

    if (attempts[username].count >= 4) {
        attempts[username].lockUntil = Date.now() + 59000;
        attempts[username].count = 0;
    }

    saveLoginAttempts(attempts);
}

function clearFailedAttempts(username) {
    const attempts = getLoginAttempts();

    if (attempts[username]) {
        delete attempts[username];
        saveLoginAttempts(attempts);
    }
}

let currentLockCountdown = null;

function startLockoutCountdown(username) {
    const msg = document.getElementById("msg");
    const loginButtons = document.querySelectorAll(".login-btn");

    if (!msg) return;

    if (currentLockCountdown) {
        clearInterval(currentLockCountdown);
    }

    currentLockCountdown = setInterval(() => {
        const remaining = getRemainingLockTime(username);

        if (remaining <= 0) {
            clearInterval(currentLockCountdown);
            currentLockCountdown = null;
            msg.innerText = "Lock expired. You can try logging in again.";

            loginButtons.forEach(button => {
                button.disabled = false;
            });

            return;
        }

        msg.innerText = `Too many incorrect password attempts. Try again in ${remaining} seconds.`;

        loginButtons.forEach(button => {
            button.disabled = true;
        });
    }, 1000);
}

/* =========================
   THEME
========================= */
function updateThemeButtons() {
    const themeButtons = document.querySelectorAll(".theme-toggle-btn");
    const isLight = document.body.classList.contains("light-mode");

    themeButtons.forEach(button => {
        button.textContent = isLight ? "Dark Mode" : "Light Mode";
    });
}

function applyTheme() {
    const savedTheme = localStorage.getItem("hotelTheme");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    } else {
        document.body.classList.remove("light-mode");
    }

    updateThemeButtons();
}

function toggleTheme() {
    document.body.classList.toggle("light-mode");

    const isLight = document.body.classList.contains("light-mode");
    localStorage.setItem("hotelTheme", isLight ? "light" : "dark");

    updateThemeButtons();
}

/* =========================
   AUTH
========================= */
function checkAuth() {
    const user = getLoggedInUser();

    if (!user) {
        window.location.href = "login.html";
    }
}

function checkAdmin() {
    const user = getLoggedInUser();

    if (!user || user.role !== "admin") {
        alert("Access denied. Admins only.");
        window.location.href = "index.html";
    }
}

function logout() {
    localStorage.removeItem("loggedInHotelUser");
    sessionStorage.removeItem("loggedInHotelUser");
    window.location.href = "login.html";
}

/* =========================
   FIELD VALIDATION UI
========================= */
function clearFieldErrors() {
    document.querySelectorAll(".input-error").forEach(field => {
        field.classList.remove("input-error");
    });
}

function markFieldError(field) {
    if (field) {
        field.classList.add("input-error");
    }
}

/* =========================
   REGISTER / LOGIN
========================= */
function register() {
    clearFieldErrors();

    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const role = document.getElementById("role");
    const msg = document.getElementById("msg");

    if (!username || !password || !role || !msg) return;

    const usernameValue = username.value.trim();
    const passwordValue = password.value.trim();
    const roleValue = role.value;

    if (!usernameValue || !passwordValue || !roleValue) {
        msg.innerText = "Please fill up required fields.";

        if (!usernameValue) markFieldError(username);
        if (!passwordValue) markFieldError(password);
        if (!roleValue) markFieldError(role);

        return;
    }

    if (passwordValue.length < 6) {
        msg.innerText = "Password must be at least 6 characters.";
        markFieldError(password);
        return;
    }

    const users = getUsers();

    const userExists = users.find(user =>
        user.username.toLowerCase() === usernameValue.toLowerCase()
    );

    if (userExists) {
        msg.innerText = "User already exists.";
        markFieldError(username);
        return;
    }

    users.push({
        username: usernameValue,
        password: passwordValue,
        role: roleValue
    });

    saveUsers(users);

    msg.innerText = "Registration successful. You can now log in.";

    username.value = "";
    password.value = "";
    role.value = "";
}

function login() {
    clearFieldErrors();

    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const role = document.getElementById("role");
    const rememberMe = document.getElementById("rememberMe");
    const msg = document.getElementById("msg");
    const loginButtons = document.querySelectorAll(".login-btn");

    if (!username || !password || !role || !msg) return;

    const usernameValue = username.value.trim();
    const passwordValue = password.value.trim();
    const roleValue = role.value;
    const remember = rememberMe ? rememberMe.checked : false;

    if (!usernameValue || !passwordValue || !roleValue) {
        msg.innerText = "Please fill up required fields.";

        if (!usernameValue) markFieldError(username);
        if (!passwordValue) markFieldError(password);
        if (!roleValue) markFieldError(role);

        return;
    }

    const users = getUsers();

    const userWithSameUsername = users.find(user =>
        user.username.toLowerCase() === usernameValue.toLowerCase()
    );

    if (!userWithSameUsername) {
        msg.innerText = "Invalid login details.";
        return;
    }

    const remainingLockTime = getRemainingLockTime(userWithSameUsername.username);

    if (remainingLockTime > 0) {
        msg.innerText = `Too many incorrect password attempts. Try again in ${remainingLockTime} seconds.`;
        markFieldError(password);

        loginButtons.forEach(button => {
            button.disabled = true;
        });

        startLockoutCountdown(userWithSameUsername.username);
        return;
    }

    loginButtons.forEach(button => {
        button.disabled = false;
    });

    if (userWithSameUsername.role !== roleValue) {
        msg.innerText = "Invalid login details.";
        return;
    }

    if (userWithSameUsername.password !== passwordValue) {
        registerFailedAttempt(userWithSameUsername.username);

        const newRemainingLockTime = getRemainingLockTime(userWithSameUsername.username);

        if (newRemainingLockTime > 0) {
            msg.innerText = `Too many incorrect password attempts. You are locked out for ${newRemainingLockTime} seconds.`;
            startLockoutCountdown(userWithSameUsername.username);
        } else {
            const attempts = getLoginAttempts();
            const currentCount = attempts[userWithSameUsername.username]?.count || 0;
            const triesLeft = 4 - currentCount;

            msg.innerText = `Incorrect password. ${triesLeft} attempt${triesLeft === 1 ? "" : "s"} left before 59-second lockout.`;
        }

        markFieldError(password);
        return;
    }

    clearFailedAttempts(userWithSameUsername.username);

    if (remember) {
        localStorage.setItem("loggedInHotelUser", JSON.stringify(userWithSameUsername));
    } else {
        sessionStorage.setItem("loggedInHotelUser", JSON.stringify(userWithSameUsername));
    }

    window.location.href = "index.html";
}

/* =========================
   ROOMS
========================= */
function renderRooms() {
    const roomGrid = document.getElementById("roomGrid");
    if (!roomGrid) return;

    roomGrid.innerHTML = HOTEL_ROOMS.map((room, index) => `
        <div class="room-card ${getRoomCardClass(room.type)}" id="room-card-${index}">
            <img src="${room.image}" alt="${room.type} Room">
            <h3>${room.type} Room - ${room.number}</h3>
            <p>Comfortable and well-furnished room.</p>
            <p><strong>Price:</strong> R${room.price} per night</p>
            
            <div class="room-actions">
                <select class="room-action-dropdown" onchange="handleRoomAction(this, ${index})">
                    <option value="">Manage Room...</option>
                    <option value="like">Like Room ❤️</option>
                    <option value="delete">Delete Room 🗑️</option>
                </select>
            </div>
        </div>
    `).join("");
}

// Handles choices made inside the dropdown menu
function handleRoomAction(dropdown, index) {
    const action = dropdown.value;
    if (action === "like") {
        likeRoom(index);
    } else if (action === "delete") {
        deleteRoom(index);
    }
    dropdown.value = ""; // Reset dropdown selection
}

// Logic for Liking a Room
function likeRoom(index) {
    const card = document.getElementById(`room-card-${index}`);
    card.classList.toggle("liked-room");
    
    if (card.classList.contains("liked-room")) {
        alert(`You liked Room ${HOTEL_ROOMS[index].number}!`);
    }
}

// Logic for Deleting a Room from the UI array
function deleteRoom(index) {
    const confirmDelete = confirm(`Are you sure you want to delete Room ${HOTEL_ROOMS[index].number}?`);
    if (confirmDelete) {
        HOTEL_ROOMS.splice(index, 1); // Remove the room from the array
        renderRooms(); // Refresh the grid instantly
    }
}

/* =========================
   BOOKING
========================= */
function setMinDates() {
    const today = new Date().toISOString().split("T")[0];

    const checkIn = document.getElementById("checkInDate");
    const checkOut = document.getElementById("checkOutDate");

    if (checkIn) checkIn.min = today;
    if (checkOut) checkOut.min = today;
}

function populateRoomNumbers() {
    const roomType = document.getElementById("roomType");
    const roomNumber = document.getElementById("roomNumber");

    if (!roomType || !roomNumber) return;

    const selectedType = roomType.value;
    roomNumber.innerHTML = '<option value="">Select room number</option>';

    const filteredRooms = HOTEL_ROOMS.filter(room => room.type === selectedType);

    filteredRooms.forEach(room => {
        const option = document.createElement("option");
        option.value = room.number;
        option.textContent = `${room.number} (${room.type})`;
        roomNumber.appendChild(option);
    });
}

function calculatePrice() {
    const roomNumber = document.getElementById("roomNumber");
    const checkIn = document.getElementById("checkInDate");
    const checkOut = document.getElementById("checkOutDate");
    const totalPriceElement = document.getElementById("totalPrice");

    if (!roomNumber || !checkIn || !checkOut || !totalPriceElement) return;

    if (!roomNumber.value || !checkIn.value || !checkOut.value) {
        totalPriceElement.innerText = "R0";
        return;
    }

    const room = getRoomByNumber(roomNumber.value);

    if (!room) {
        totalPriceElement.innerText = "R0";
        return;
    }

    const inDate = new Date(checkIn.value);
    const outDate = new Date(checkOut.value);
    const days = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
        totalPriceElement.innerText = "R0";
        return;
    }

    totalPriceElement.innerText = `R${room.price * days}`;
}

function isRoomBooked(roomNumber, checkInDate, checkOutDate, ignoreBookingId = null) {
    const bookings = getBookings();

    return bookings.some(booking => {
        if (booking.roomNumber !== roomNumber) return false;
        if (ignoreBookingId && booking.id === ignoreBookingId) return false;
        if (booking.status === "Cancelled") return false;

        const existingCheckIn = new Date(booking.checkInDate);
        const existingCheckOut = new Date(booking.checkOutDate);
        const newCheckIn = new Date(checkInDate);
        const newCheckOut = new Date(checkOutDate);

        return newCheckIn < existingCheckOut && newCheckOut > existingCheckIn;
    });
}

function saveBooking() {
    clearFieldErrors();

    const user = getLoggedInUser();
    const bookingMsg = document.getElementById("bookingMsg");

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const editingBookingId = document.getElementById("editingBookingId");
    const customerName = document.getElementById("customerName");
    const customerEmail = document.getElementById("customerEmail");
    const roomType = document.getElementById("roomType");
    const roomNumber = document.getElementById("roomNumber");
    const checkInDate = document.getElementById("checkInDate");
    const checkOutDate = document.getElementById("checkOutDate");
    const guests = document.getElementById("guests");

    if (
        !customerName || !customerEmail || !roomType || !roomNumber ||
        !checkInDate || !checkOutDate || !guests || !bookingMsg
    ) return;

    if (
        !customerName.value.trim() ||
        !customerEmail.value.trim() ||
        !roomType.value ||
        !roomNumber.value ||
        !checkInDate.value ||
        !checkOutDate.value ||
        !guests.value
    ) {
        bookingMsg.innerText = "Please fill up required fields.";

        if (!customerName.value.trim()) markFieldError(customerName);
        if (!customerEmail.value.trim()) markFieldError(customerEmail);
        if (!roomType.value) markFieldError(roomType);
        if (!roomNumber.value) markFieldError(roomNumber);
        if (!checkInDate.value) markFieldError(checkInDate);
        if (!checkOutDate.value) markFieldError(checkOutDate);
        if (!guests.value) markFieldError(guests);

        return;
    }

    const room = getRoomByNumber(roomNumber.value);
    const inDate = new Date(checkInDate.value);
    const outDate = new Date(checkOutDate.value);
    const days = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
        bookingMsg.innerText = "Check-out date must be after check-in date.";
        markFieldError(checkOutDate);
        return;
    }

    const ignoreId = editingBookingId && editingBookingId.value ? Number(editingBookingId.value) : null;

    if (isRoomBooked(roomNumber.value, checkInDate.value, checkOutDate.value, ignoreId)) {
        bookingMsg.innerText = "This room is already booked for those dates.";
        markFieldError(roomNumber);
        return;
    }

    const totalPrice = room.price * days;
    let bookings = getBookings();

    if (editingBookingId && editingBookingId.value) {
        bookings = bookings.map(booking => {
            if (booking.id === Number(editingBookingId.value)) {
                return {
                    ...booking,
                    customerName: customerName.value.trim(),
                    customerEmail: customerEmail.value.trim(),
                    roomType: roomType.value,
                    roomNumber: roomNumber.value,
                    checkInDate: checkInDate.value,
                    checkOutDate: checkOutDate.value,
                    guests: guests.value,
                    totalPrice
                };
            }
            return booking;
        });

        bookingMsg.innerText = "Booking updated successfully.";
    } else {
        bookings.push({
            id: Date.now(),
            username: user.username,
            customerName: customerName.value.trim(),
            customerEmail: customerEmail.value.trim(),
            roomType: roomType.value,
            roomNumber: roomNumber.value,
            checkInDate: checkInDate.value,
            checkOutDate: checkOutDate.value,
            guests: guests.value,
            totalPrice: totalPrice,
            status: "Pending",
            approvalStatus: "Pending Approval",
            paymentStatus: "Unpaid",
            paymentMethod: "-",
            cardOwner: "",
            refundAmount: 0
        });

        bookingMsg.innerText = "Booking created successfully.";
    }

    saveBookings(bookings);
    clearBookingForm();

    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 500);
}

function clearBookingForm() {
    const formIds = [
        "editingBookingId",
        "customerName",
        "customerEmail",
        "roomType",
        "checkInDate",
        "checkOutDate",
        "guests"
    ];

    formIds.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = "";
    });

    const roomNumber = document.getElementById("roomNumber");
    if (roomNumber) {
        roomNumber.innerHTML = '<option value="">Select room number</option>';
    }

    const totalPrice = document.getElementById("totalPrice");
    if (totalPrice) {
        totalPrice.innerText = "R0";
    }
}

function editBooking(id) {
    localStorage.setItem("editingBookingId", id);
    window.location.href = "booking.html";
}

function loadBookingForEdit() {
    const editId = localStorage.getItem("editingBookingId");
    if (!editId) return;

    const bookings = getBookings();
    const booking = bookings.find(item => item.id === Number(editId));

    if (!booking) return;

    const editingBookingId = document.getElementById("editingBookingId");
    const customerName = document.getElementById("customerName");
    const customerEmail = document.getElementById("customerEmail");
    const roomType = document.getElementById("roomType");
    const roomNumber = document.getElementById("roomNumber");
    const checkInDate = document.getElementById("checkInDate");
    const checkOutDate = document.getElementById("checkOutDate");
    const guests = document.getElementById("guests");
    const totalPrice = document.getElementById("totalPrice");

    if (!editingBookingId || !customerName || !customerEmail || !roomType || !roomNumber || !checkInDate || !checkOutDate || !guests || !totalPrice) {
        return;
    }

    editingBookingId.value = booking.id;
    customerName.value = booking.customerName;
    customerEmail.value = booking.customerEmail;
    roomType.value = booking.roomType;

    populateRoomNumbers();

    roomNumber.value = booking.roomNumber;
    checkInDate.value = booking.checkInDate;
    checkOutDate.value = booking.checkOutDate;
    guests.value = booking.guests;
    totalPrice.innerText = `R${booking.totalPrice}`;

    localStorage.removeItem("editingBookingId");
}

function cancelBooking(id) {
    let bookings = getBookings();

    bookings = bookings.filter(booking => booking.id !== id);

    saveBookings(bookings);

    renderBookings();
    renderAdminPanel();
    renderPaymentOptions();
    renderReceipt();
    renderUserBookings();
}

/* =========================
   STATUS / DASHBOARD
========================= */
function updateBookingStatus(id, status) {
    let bookings = getBookings();

    bookings = bookings.map(booking => {
        if (booking.id === id) {
            return { ...booking, status };
        }
        return booking;
    });

    saveBookings(bookings);

    renderBookings();
    renderAdminPanel();
    renderUserBookings();
    renderReceipt();
}

function renderBookings() {
    const user = getLoggedInUser();
    const bookingsList = document.getElementById("bookingsList");

    if (!bookingsList || !user) return;

    let bookings = getBookings();

    if (user.role !== "admin") {
        bookings = bookings.filter(booking => booking.username === user.username);
    }

    const searchName = document.getElementById("searchName")?.value.toLowerCase() || "";
    const searchDate = document.getElementById("searchDate")?.value || "";
    const searchRoomType = document.getElementById("searchRoomType")?.value || "";

    bookings = bookings.filter(booking => {
        const matchesName = booking.customerName.toLowerCase().includes(searchName);
        const matchesDate = !searchDate || booking.checkInDate === searchDate || booking.checkOutDate === searchDate;
        const matchesRoomType = !searchRoomType || booking.roomType === searchRoomType;

        return matchesName && matchesDate && matchesRoomType;
    });

    if (bookings.length === 0) {
        bookingsList.innerHTML = "<p>No bookings found.</p>";
        return;
    }

    bookingsList.innerHTML = bookings.map(booking => `
        <div class="booking-card ${getBookingCardClass(booking.roomType)}">
            <h3>${booking.roomType} Room - ${booking.roomNumber}</h3>
            <p><strong>Name:</strong> ${booking.customerName}</p>
            <p><strong>Email:</strong> ${booking.customerEmail}</p>
            <p><strong>Guests:</strong> ${booking.guests}</p>
            <p><strong>Check-In:</strong> ${booking.checkInDate}</p>
            <p><strong>Check-Out:</strong> ${booking.checkOutDate}</p>
            <p><strong>Total Price:</strong> R${booking.totalPrice}</p>
            <p><strong>Status:</strong> ${booking.status}</p>
            <p><strong>Approval:</strong> ${booking.approvalStatus || "Pending Approval"}</p>
            <p><strong>Payment:</strong> ${booking.paymentStatus} (${booking.paymentMethod})</p>
            <div>
                <button class="action-btn" onclick="editBooking(${booking.id})">Edit</button>
                <button class="status-btn" onclick="updateBookingStatus(${booking.id}, 'Checked In')">Check In</button>
                <button class="status-btn" onclick="updateBookingStatus(${booking.id}, 'Checked Out')">Check Out</button>
                <button class="action-btn" onclick="openPaymentForBooking(${booking.id})">Pay</button>
                <button class="cancel-btn" onclick="cancelBooking(${booking.id})">Cancel</button>
            </div>
        </div>
    `).join("");
}

/* =========================
   PAYMENT
========================= */
function openPaymentForBooking(id) {
    localStorage.setItem("selectedPaymentBookingId", id);
    window.location.href = "payment.html";
}

function renderPaymentOptions() {
    const select = document.getElementById("paymentBookingId");
    if (!select) return;

    const user = getLoggedInUser();
    if (!user) return;

    let bookings = getBookings();

    if (user.role !== "admin") {
        bookings = bookings.filter(booking => booking.username === user.username);
    }

    select.innerHTML = '<option value="">Select booking</option>';

    bookings.forEach(booking => {
        const option = document.createElement("option");
        option.value = booking.id;
        option.textContent = `${booking.customerName} - Room ${booking.roomNumber} - R${booking.totalPrice}`;
        select.appendChild(option);
    });

    const savedId = localStorage.getItem("selectedPaymentBookingId");
    if (savedId) {
        select.value = savedId;
        localStorage.removeItem("selectedPaymentBookingId");
    }
}

function simulatePayment() {
    clearFieldErrors();

    const bookingField = document.getElementById("paymentBookingId");
    const paymentMethodField = document.getElementById("paymentMethod");
    const cardOwnerField = document.getElementById("cardOwner");
    const cardNumberField = document.getElementById("cardNumber");
    const expiryDateField = document.getElementById("expiryDate");
    const cardCvcField = document.getElementById("cardCvc");
    const paymentMsg = document.getElementById("paymentMsg");

    if (
        !bookingField || !paymentMethodField || !cardOwnerField ||
        !cardNumberField || !expiryDateField || !cardCvcField || !paymentMsg
    ) return;

    const bookingId = Number(bookingField.value);
    const paymentMethod = paymentMethodField.value;
    const cardOwner = cardOwnerField.value.trim();
    const cardNumberRaw = cardNumberField.value.replace(/\s/g, "");
    const expiryDate = expiryDateField.value;
    const cardCvc = cardCvcField.value.trim();

    if (!bookingField.value || !paymentMethod || !cardOwner || !cardNumberRaw || !expiryDate || !cardCvc) {
        paymentMsg.innerText = "Please fill up required fields.";

        if (!bookingField.value) markFieldError(bookingField);
        if (!paymentMethod) markFieldError(paymentMethodField);
        if (!cardOwner) markFieldError(cardOwnerField);
        if (!cardNumberRaw) markFieldError(cardNumberField);
        if (!expiryDate) markFieldError(expiryDateField);
        if (!cardCvc) markFieldError(cardCvcField);

        return;
    }

    if (!/^\d{16}$/.test(cardNumberRaw)) {
        paymentMsg.innerText = "Card number must be 16 digits.";
        markFieldError(cardNumberField);
        return;
    }

    if (!/^\d{3,4}$/.test(cardCvc)) {
        paymentMsg.innerText = "CVC must be 3 or 4 digits.";
        markFieldError(cardCvcField);
        return;
    }

    let bookings = getBookings();

    bookings = bookings.map(booking => {
        if (booking.id === bookingId) {
            return {
                ...booking,
                paymentStatus: "Paid",
                paymentMethod: paymentMethod,
                cardOwner: cardOwner,
                refundAmount: 0
            };
        }
        return booking;
    });

    saveBookings(bookings);

    paymentMsg.innerText = "Payment successful.";

    cardOwnerField.value = "";
    cardNumberField.value = "";
    expiryDateField.value = "";
    cardCvcField.value = "";

    renderReceipt();
    renderBookings();
    renderAdminPanel();
    renderUserBookings();
}

function renderReceipt() {
    const receiptBox = document.getElementById("receiptBox");
    const paymentSelect = document.getElementById("paymentBookingId");

    if (!receiptBox || !paymentSelect || !paymentSelect.value) {
        return;
    }

    const bookingId = Number(paymentSelect.value);
    const bookings = getBookings();
    const booking = bookings.find(item => item.id === bookingId);

    if (!booking) {
        receiptBox.innerHTML = "<p>No receipt available.</p>";
        return;
    }

    if (booking.paymentStatus !== "Paid" && booking.paymentStatus !== "Refunded") {
        receiptBox.innerHTML = "<p>No payment receipt yet.</p>";
        return;
    }

    receiptBox.innerHTML = `
        <h3>Grand Palace Hotel Receipt</h3>
        <p><strong>Customer:</strong> ${booking.customerName}</p>
        <p><strong>Email:</strong> ${booking.customerEmail}</p>
        <p><strong>Room:</strong> ${booking.roomType} - ${booking.roomNumber}</p>
        <p><strong>Check-In:</strong> ${booking.checkInDate}</p>
        <p><strong>Check-Out:</strong> ${booking.checkOutDate}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
        <p><strong>Approval:</strong> ${booking.approvalStatus || "Pending Approval"}</p>
        <p><strong>Payment Status:</strong> ${booking.paymentStatus}</p>
        <p><strong>Payment Method:</strong> ${booking.paymentMethod}</p>
        <p><strong>Card Owner:</strong> ${booking.cardOwner || "-"}</p>
        <p><strong>Refund Amount:</strong> R${booking.refundAmount || 0}</p>
        <p><strong>Total Amount:</strong> R${booking.totalPrice}</p>
    `;
}

/* =========================
   PROFILE
========================= */
function loadUserProfile() {
    const user = getLoggedInUser();
    if (!user) return;

    const avatarPreview = document.getElementById("avatarPreview");
    const profileName = document.getElementById("profileName");
    const profileRole = document.getElementById("profileRole");
    const profileUsername = document.getElementById("profileUsername");
    const profileRoleInfo = document.getElementById("profileRoleInfo");

    if (profileName) profileName.innerText = user.username;
    if (profileRole) profileRole.innerText = user.role;
    if (profileUsername) profileUsername.innerText = user.username;
    if (profileRoleInfo) profileRoleInfo.innerText = user.role;

    if (avatarPreview) {
        if (user.profileImage) {
            avatarPreview.innerHTML = `<img src="${user.profileImage}" alt="Profile Image">`;
        } else {
            avatarPreview.innerHTML = user.username.charAt(0).toUpperCase();
        }
    }
}

function previewProfileImage(event) {
    const file = event.target.files[0];
    const avatarPreview = document.getElementById("avatarPreview");
    const user = getLoggedInUser();

    if (!file || !avatarPreview || !user) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Preview Image">`;
    };

    reader.readAsDataURL(file);
}

function uploadProfileImage() {
    const fileInput = document.getElementById("profileImageInput");
    const profileImageMsg = document.getElementById("profileImageMsg");
    const file = fileInput ? fileInput.files[0] : null;
    const user = getLoggedInUser();

    if (!file || !user) {
        if (profileImageMsg) profileImageMsg.innerText = "Please select an image.";
        return;
    }

    if (!file.type.startsWith("image/")) {
        if (profileImageMsg) profileImageMsg.innerText = "Please choose a valid image file.";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const img = new Image();

        img.onload = function () {
            const canvas = document.createElement("canvas");
            const maxSize = 300;

            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxSize) {
                    height = Math.round((height * maxSize) / width);
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = Math.round((width * maxSize) / height);
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            const compressedImage = canvas.toDataURL("image/jpeg", 0.75);

            let users = getUsers();

            users = users.map(u => {
                if (u.username === user.username) {
                    return { ...u, profileImage: compressedImage };
                }
                return u;
            });

            saveUsers(users);

            const updatedUser = { ...user, profileImage: compressedImage };

            if (localStorage.getItem("loggedInHotelUser")) {
                localStorage.setItem("loggedInHotelUser", JSON.stringify(updatedUser));
            } else {
                sessionStorage.setItem("loggedInHotelUser", JSON.stringify(updatedUser));
            }

            if (profileImageMsg) profileImageMsg.innerText = "Profile image uploaded successfully.";

            if (fileInput) fileInput.value = "";

            loadUserProfile();
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function removeProfileImage() {
    const user = getLoggedInUser();
    const profileImageMsg = document.getElementById("profileImageMsg");
    const fileInput = document.getElementById("profileImageInput");

    if (!user) return;

    let users = getUsers();

    users = users.map(u => {
        if (u.username === user.username) {
            const updatedUser = { ...u };
            delete updatedUser.profileImage;
            return updatedUser;
        }
        return u;
    });

    saveUsers(users);

    const updatedLoggedInUser = { ...user };
    delete updatedLoggedInUser.profileImage;

    if (localStorage.getItem("loggedInHotelUser")) {
        localStorage.setItem("loggedInHotelUser", JSON.stringify(updatedLoggedInUser));
    } else {
        sessionStorage.setItem("loggedInHotelUser", JSON.stringify(updatedLoggedInUser));
    }

    if (fileInput) fileInput.value = "";
    if (profileImageMsg) profileImageMsg.innerText = "Profile image removed.";

    loadUserProfile();
}

function renderUserBookings() {
    const user = getLoggedInUser();
    const userBookingsList = document.getElementById("userBookingsList");

    if (!userBookingsList || !user) return;

    const bookings = getBookings().filter(booking => booking.username === user.username);

    if (bookings.length === 0) {
        userBookingsList.innerHTML = "<p>No bookings found for this customer.</p>";
        return;
    }

    userBookingsList.innerHTML = bookings.map(booking => `
        <div class="booking-card ${getBookingCardClass(booking.roomType)}">
            <h3>${booking.roomType} Room - ${booking.roomNumber}</h3>
            <p><strong>Name:</strong> ${booking.customerName}</p>
            <p><strong>Check-In:</strong> ${booking.checkInDate}</p>
            <p><strong>Check-Out:</strong> ${booking.checkOutDate}</p>
            <p><strong>Total Price:</strong> R${booking.totalPrice}</p>
            <p><strong>Status:</strong> ${booking.status}</p>
            <p><strong>Approval:</strong> ${booking.approvalStatus || "Pending Approval"}</p>
            <p><strong>Payment:</strong> ${booking.paymentStatus}</p>
        </div>
    `).join("");
}

/* =========================
   ADMIN ACTIONS
========================= */
function approveGuest(id) {
    let bookings = getBookings();

    bookings = bookings.map(booking => {
        if (booking.id === id) {
            if (booking.paymentStatus !== "Paid") {
                alert("Guest cannot be approved until payment is completed.");
                return booking;
            }

            return {
                ...booking,
                approvalStatus: "Approved"
            };
        }
        return booking;
    });

    saveBookings(bookings);
    renderAdminPanel();
    renderBookings();
    renderUserBookings();
    renderReceipt();
}

function processRefund(id) {
    let bookings = getBookings();

    bookings = bookings.map(booking => {
        if (booking.id === id) {
            if (booking.paymentStatus !== "Paid") {
                alert("Only paid bookings can be refunded.");
                return booking;
            }

            return {
                ...booking,
                paymentStatus: "Refunded",
                refundAmount: Number(booking.totalPrice),
                approvalStatus: "Refunded",
                status: "Cancelled"
            };
        }
        return booking;
    });

    saveBookings(bookings);
    renderAdminPanel();
    renderBookings();
    renderUserBookings();
    renderReceipt();
}

function adminCancelBooking(id) {
    let bookings = getBookings();

    bookings = bookings.map(booking => {
        if (booking.id === id) {
            return {
                ...booking,
                status: "Cancelled",
                approvalStatus: "Rejected"
            };
        }
        return booking;
    });

    saveBookings(bookings);
    renderAdminPanel();
    renderBookings();
    renderUserBookings();
    renderReceipt();
}

/* =========================
   ADMIN PANEL
========================= */
function renderAdminPanel() {
    const usersList = document.getElementById("adminUsersList");
    const bookingsList = document.getElementById("adminBookingsList");

    if (!usersList || !bookingsList) return;

    const users = getUsers();
    const bookings = getBookings();

    const totalRevenueValue = bookings
        .filter(b => b.paymentStatus === "Paid")
        .reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);

    const totalRefundsValue = bookings
        .filter(b => b.paymentStatus === "Refunded")
        .reduce((sum, booking) => sum + Number(booking.refundAmount || booking.totalPrice || 0), 0);

    const netRevenueValue = totalRevenueValue - totalRefundsValue;

    const totalUsers = document.getElementById("totalUsers");
    const totalBookings = document.getElementById("totalBookings");
    const paidBookings = document.getElementById("paidBookings");
    const unpaidBookings = document.getElementById("unpaidBookings");
    const approvedBookings = document.getElementById("approvedBookings");
    const checkedInCount = document.getElementById("checkedInCount");
    const checkedOutCount = document.getElementById("checkedOutCount");
    const totalRevenue = document.getElementById("totalRevenue");
    const totalRefunds = document.getElementById("totalRefunds");
    const netRevenue = document.getElementById("netRevenue");

    if (totalUsers) totalUsers.innerText = users.length;
    if (totalBookings) totalBookings.innerText = bookings.length;
    if (paidBookings) paidBookings.innerText = bookings.filter(b => b.paymentStatus === "Paid").length;
    if (unpaidBookings) unpaidBookings.innerText = bookings.filter(b => b.paymentStatus === "Unpaid").length;
    if (approvedBookings) approvedBookings.innerText = bookings.filter(b => b.approvalStatus === "Approved").length;
    if (checkedInCount) checkedInCount.innerText = bookings.filter(b => b.status === "Checked In").length;
    if (checkedOutCount) checkedOutCount.innerText = bookings.filter(b => b.status === "Checked Out").length;
    if (totalRevenue) totalRevenue.innerText = `R${totalRevenueValue}`;
    if (totalRefunds) totalRefunds.innerText = `R${totalRefundsValue}`;
    if (netRevenue) netRevenue.innerText = `R${netRevenueValue}`;

    usersList.innerHTML = users.map(user => `
        <div class="admin-box">
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Role:</strong> ${user.role}</p>
        </div>
    `).join("");

    if (bookings.length === 0) {
        bookingsList.innerHTML = "<p>No bookings available.</p>";
        return;
    }

    bookingsList.innerHTML = bookings.map(booking => `
        <div class="booking-card ${getBookingCardClass(booking.roomType)}">
            <h3>${booking.roomType} Room - ${booking.roomNumber}</h3>
            <p><strong>Customer:</strong> ${booking.customerName}</p>
            <p><strong>User Account:</strong> ${booking.username}</p>
            <p><strong>Email:</strong> ${booking.customerEmail}</p>
            <p><strong>Guests:</strong> ${booking.guests}</p>
            <p><strong>Dates:</strong> ${booking.checkInDate} to ${booking.checkOutDate}</p>
            <p><strong>Total:</strong> R${booking.totalPrice}</p>
            <p><strong>Booking Status:</strong> ${booking.status}</p>
            <p><strong>Approval:</strong> ${booking.approvalStatus || "Pending Approval"}</p>
            <p><strong>Payment:</strong> ${booking.paymentStatus}</p>
            <p><strong>Method:</strong> ${booking.paymentMethod}</p>
            <p><strong>Refund Amount:</strong> R${booking.refundAmount || 0}</p>

            <div class="status-badge">ID: ${booking.id}</div>

            <div>
                <button class="approve-btn" onclick="approveGuest(${booking.id})">Approve Guest</button>
                <button class="status-btn" onclick="updateBookingStatus(${booking.id}, 'Checked In')">Check In</button>
                <button class="status-btn" onclick="updateBookingStatus(${booking.id}, 'Checked Out')">Check Out</button>
                <button class="action-btn" onclick="editBooking(${booking.id})">Edit</button>
                <button class="refund-btn" onclick="processRefund(${booking.id})">Refund</button>
                <button class="reject-btn" onclick="adminCancelBooking(${booking.id})">Cancel Booking</button>
            </div>
        </div>
    `).join("");
}

/* =========================
   PAGE LOAD HELPERS
========================= */
window.addEventListener("load", () => {
    const usernameField = document.getElementById("username");
    const msg = document.getElementById("msg");
    const loginButtons = document.querySelectorAll(".login-btn");

    if (!usernameField || !msg) return;

    usernameField.addEventListener("blur", () => {
        const usernameValue = usernameField.value.trim();
        if (!usernameValue) return;

        const users = getUsers();
        const foundUser = users.find(user =>
            user.username.toLowerCase() === usernameValue.toLowerCase()
        );

        if (!foundUser) return;

        const remaining = getRemainingLockTime(foundUser.username);

        if (remaining > 0) {
            msg.innerText = `Too many incorrect password attempts. Try again in ${remaining} seconds.`;

            loginButtons.forEach(button => {
                button.disabled = true;
            });

            startLockoutCountdown(foundUser.username);
        } else {
            loginButtons.forEach(button => {
                button.disabled = false;
            });
        }
    });
});