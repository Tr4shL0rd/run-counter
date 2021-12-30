function title(str) {
    return str.toString().replace(
        /\w\S*/g,
        txt => {
            return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
        });
}
function capitalize(str) {
    return str.toString()[0].toUpperCase() + str.toString().substring(1, str.toString().length-1);
}

module.exports = {
    title,
    capitalize
}