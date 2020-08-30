export const SetearCamposObjetoJsonUpdate = (existsObjeto, updateJson: object) => {
    Object.keys(updateJson).forEach(key => {
        existsObjeto[key] = updateJson[key] ? updateJson[key] : existsObjeto[key]
    })
}