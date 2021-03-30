function getItem(name, list) {
    return list.find(item => item.name == name);
}

function saveItem(item, list) {
    if (list.indexOf(item) < 0) {
        list.push(item);
        return true;
    }
    return false;
}

function setLinksOrder(name, list, result) {
    let item = getItem(name, list);
    if (saveItem(item, result)) {
        if (item.next) {
            setLinksOrder(item.next, list, result);        
        }

        if (item.actions) {
            for(var i in actions) {
                if (actions.hasOwnProperty(i)) {
                    setLinksOrder(actions[i], list, result);
                }
            }
        }
    }
}

export function orderList(list) {
    var acc = [];
    // Точка входа 
    // saveLinksOrder('entry', list, acc);
    // Все остальные
    list.forEach(item => setLinksOrder(item.name, list, acc))
    return acc;
}