export const createDomElement = (selector, classes, text) => {
    const elem = document.createElement(selector);

    if(classes)
        classes.forEach(cl => elem.classList.add(cl));

    if(text != null)
        elem.innerText = text;

    return elem;
}

export const getData = async (url, failedFetchAlert) => {
    const data = await fetch(url, {redirect: "error"});

    if(data.status !== 200 && failedFetchAlert){
        alert(failedFetchAlert);
        return false;
    }

    return await data.json();
}
