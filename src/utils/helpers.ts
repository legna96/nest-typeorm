// =====  REQUEST VALIDATORS =======//

export const SetearCamposObjetoJsonUpdate = (existsObjeto, updateJson: object) => {
    Object.keys(updateJson).forEach(key => {
        if (Object.keys(existsObjeto).includes(key)) {
            existsObjeto[key] = updateJson[key] ? updateJson[key] : existsObjeto[key]
        }
    })
}

export const OnlyRequestFields = (updateJson: object, fields: Array<string>) => {
    let obj;
    fields.forEach(field => {
        if (Object.keys(updateJson).includes(field)) {
            obj = {
                ...obj,
                [field]: updateJson[field]
            }
        }
    });
    return obj;
};