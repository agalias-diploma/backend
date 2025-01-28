function formatName(name) {
    const space = name.indexOf(' ');
    const fName = name.substring(0, space);
    const lName = name.substring(space + 1);
    const formattedFName = fName.charAt(0).toUpperCase() + fName.slice(1);
    const formattedLName = lName.charAt(0).toUpperCase() + lName.slice(1);

    return {
        firstName: formattedFName,
        lastName: formattedLName,
    };
}

module.exports = {
    formatName,
};
