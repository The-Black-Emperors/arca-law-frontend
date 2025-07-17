export function showToast(message, type = 'success') {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: type === 'success' ? "linear-gradient(to right, #00b09b, #96c93d)" : "linear-gradient(to right, #ff5f6d, #ffc371)",
        },
    }).showToast();
}