export function formatDate(value) {
    return new Date(value * 1000).toISOString().substr(11, 8);
}

export function styleDate(value) {
    return `<strong>${value.substr(0, 5)}</strong>:${value.substr(6, 2)}`;
}