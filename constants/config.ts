// constants/Config.ts

const DEV_IP = 'http://xxx.xxx.x.x';

export const BASE_URL = `${DEV_IP}:8080/api`;

export const ENDPOINTS = {
    LANGUAGES: `${BASE_URL}/language/allLanguages`,
    ADD_LANGUAGE: `${BASE_URL}/language/addLanguage`,
    UPDATE_LANGUAGE: `${BASE_URL}/language/updateLanguage`,
    DELETE_LANGUAGE: `${BASE_URL}/language/delete`,

    TRANSLATE: `${BASE_URL}/translate`,
    ALL_TRANSLATE: `${BASE_URL}/translate/allTranslation`,
    GET_TRANSLATE: `${BASE_URL}/translate/byLanguage`,
    ADD_TRANSLATE: `${BASE_URL}/translate/add`,
    DELETE_TRANSLATE: `${BASE_URL}/translate/delete`,
    UPDATE_TRANSLATE: `${BASE_URL}/translate/update`,

};