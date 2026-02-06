import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import { session, local } from 'wix-storage';
import { getFirebaseServices } from "public/firebaseApp.js";
import { initializeApp } from 'firebase/app';
import { signOut } from "firebase/auth";
import { getAuth, onAuthStateChanged, updateProfile, removeSession } from "firebase/auth";
import { getAppCheckToken } from 'public/firebaseApp.js';
import { AuthToken } from "public/utils/auth.js";
import { getConfig } from 'backend/FirebaseConfig';
import { userExist, updateUserProfile, getUserProfile } from 'backend/API'

import { getAccess, cancelSubscription } from 'backend/paypal.jsw';

import { getStorage, uploadBytes, getDownloadURL, ref } from "firebase/storage";

// import { getDatabase,  ref as dbRef, get, update  } from "firebase/database";

let appCheckToken = null;

let name;
let url;
let uid
let imageUrl
let currentUserFirebase;
let infoCurrentUser;
let imgIframe, nameIFrmae, emailIframe;
let localItem = local.getItem("curr")
///const DEFAULT_AVATAR = "wix:image://v1/user-profile-circle1.png";
const DEFAULT_AVATAR = "https://static.wixstatic.com/media/34dd6b_1e73c063ef6c47cba3a71daba5db4f60~mv2.jpg/v1/fill/w_300,h_300,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/34dd6b_1e73c063ef6c47cba3a71daba5db4f60~mv2.jpg";


function validateString(input) {
    const trimmedInput = input.trim();

    if (trimmedInput.length === 0) {
        return false;
    }
    if (trimmedInput.length < 2 || trimmedInput.length > 30) {
        return false;
    }
    //const allowedCharactersPattern = /^[a-zA-Z\s]+$/;

    /*if (!allowedCharactersPattern.test(trimmedInput)) {
        return false;
    }*/

    return true;
}

function validateInstagramUrl(url) {
    if(!url) return true;

    const instagramRegex = /instagram\.com\//;
    return instagramRegex.test(url);

}

function safeSetAvatar(src) {
    if (!src) return;

    try {
        $w("#imageMain").src = src;
    } catch (err) {
        console.error("Avatar error:", err);
        $w("#imageMain").src = DEFAULT_AVATAR;

    }
}
/*
async function safeSetAvatar(src) {
    const image = $w("#imageMain");

    if (!src) {
        image.src = DEFAULT_AVATAR;
        return;
    }

    try {
        const response = await fetch(src, { method: "HEAD" });

        if (!response.ok) {
            throw new Error("Image not accessible");
        }

        image.src = src;
    } catch (err) {
        console.warn("[Avatar] fallback to default:", src);
        image.src = DEFAULT_AVATAR;
    }
}*/

$w.onReady(async function () {
    $w('#box55').collapse();
    $w('#box47').collapse();
    $w('#imageX95').expand();
    console.log("version 15");

    setTimeout(() => {
        // Проверяем, загрузилось ли имя. Если нет - значит мы зависли.
        if ($w("#textName").text === "" || $w("#textName").text === "NAME" || $w("#textName").text === "Name") { 
            console.error("⏰ TIMEOUT: Authentication took too long. Force Logout.");
            
            wixWindow.openLightbox("Err Account");
        }
    }, 15000);

    $w("#inputInstagram").onCustomValidation((value, reject) => {
        if (value && !validateInstagramUrl(value)) {
            reject("Invalid Instagram URL");
        }
    });

    function restoreSession(user, token) {
        uid = user.uid;
        local.setItem("email", user.email);
        if (token) local.setItem("firebaseIdToken", token);

        console.log("[firebaseIdToken]:", token);

        $w("#textEmail").text = user.email || "";
        $w("#textName").text = user.displayName || user.email || "";
        
        if (user.photoURL) {
            safeSetAvatar(user.photoURL);
        }
}

    try {
    appCheckToken = await getAppCheckToken();
    if (!appCheckToken) {
        console.error("Не удалось получить App Check токен. Некоторые функции могут не работать.");
    } else {
        console.log("[Subscription Page] App Check токен успешно получен.");
    }
    } catch (error) {
        console.error("Критическая ошибка при получении App Check токена:", error);
    }

    if (local.getItem("curr") == "null" || local.getItem("curr") == "undefined" || local.getItem("curr") == undefined){
        wixLocation.to("https://www.pintobe.in/")
    }

    const config = await getConfig();
    const app = initializeApp(config);
    const auth = getAuth();
    const storage = getStorage(app);
    //const dbRef = ref(getDatabase());
    userExist(local.getItem("curr"), appCheckToken).then(async (res) => {
        if (!res.status) {
            local.setItem("closed_page", "true");
            wixWindow.openLightbox("Log In")
            local.setItem("curr", null)
            local.removeItem("provider")
        } else {
            session.setItem("page", "acc")

            if (local.getItem("curr") == null) {

                wixLocation.to("https://www.pintobe.in/")
            }

            // request to get user's extra fields (instagram)

            try {
                await new Promise((resolve, reject) => {
                    onAuthStateChanged(auth, async (user) => {
                        console.log("State changed", user);
                        if (user) {
                            $w('#box55').expand();
                            $w('#box47').expand();
                            $w('#imageX95').collapse();
                            name = user.displayName
                            infoCurrentUser = user;
                            currentUserFirebase = user.uid;
                            const idToken = await user.getIdToken();
                            console.log("[onAuthStateChanged] User = ", user);
                            console.log("[onAuthStateChanged] idToken = ", idToken);
                            $w("#textEmail").text = user.email
                            local.setItem("email", user.email)
                            if (name == null) {
                                $w("#textName").text = user.email
                            } else {
                                $w("#textName").text = name
                            }
                            
                            safeSetAvatar(user.photoURL)
                            //$w("#imageMain").src = user.photoURL
                            try {
                                const profileResponse = await getUserProfile(idToken, appCheckToken);
                                if (profileResponse.success) {
                                    const instagram = profileResponse.data.instagram || ""; // <-- тут data
                                    $w("#inputInstagram").value = instagram;
                                    $w("#inputInstagram").resetValidityIndication();
                                } else {
                                    console.warn("Не удалось получить Instagram:", profileResponse.error);
                                    $w("#inputInstagram").value = "";
                                    $w("#inputInstagram").resetValidityIndication();
                                }
                            } catch (e) {
                                console.error("Ошибка при загрузке Instagram:", e);
                                $w("#inputInstagram").value = "";
                            }

                            return resolve(user);
                        }

                        return reject()
                    })
                })
            } catch (error) {
                // ... у блоці catch (error) після невдалої спроби модульної авторизації:
            console.log("Velo auth error. Попытка восстановить сессию через Iframe...");

            const html3 = $w("#html3");

            // 1. Слушаем ответы от Iframe
            html3.onMessage(async (event) => {
                const data = event.data;
                console.log("Ответ от html3:", data);

                // СЦЕНАРИЙ А: Пришли данные пользователя (стандартный вход)
                if (data.type === "USER_DATA") {
                    const user = data.user;
                    $w('#box55').expand();
                    $w('#box47').expand();
                    $w('#imageX95').collapse();
                    restoreSession(user, user.stsTokenManager?.accessToken);
                    const profileResponse = await getUserProfile(user.stsTokenManager?.accessToken, appCheckToken);
                    //console.log("[PROFILE DB]:",profileResponse.data)
                        if (profileResponse.success) {
                            const instagram = profileResponse.data.instagram || ""; // <-- тут data
                            $w("#inputInstagram").value = instagram;
                            if(profileResponse.data.photoURL)
                                safeSetAvatar(profileResponse.data.photoURL)
                            $w("#inputInstagram").resetValidityIndication();
                        }
                }
                 // СЦЕНАРИЙ Б: Пришел свежий токен после нашего запроса (ВОССТАНОВЛЕНИЕ)
                else if (data.type === "FRESH_ID_TOKEN_RESPONSE") {
                    if (data.idToken) {
                        $w('#box55').expand();
                        $w('#box47').expand();
                        $w('#imageX95').collapse();
                        console.log("Успешно восстановлен свежий токен из Iframe! [firebaseIdToken]:", data.idToken);
                        const profileResponse = await getUserProfile(data.idToken, appCheckToken);
                        if (profileResponse.success) {
                            const instagram = profileResponse.data.instagram || ""; // <-- тут data
                            $w("#inputInstagram").value = instagram;
                            $w("#inputInstagram").resetValidityIndication();
                        }
                        // Сохраняем токен, чтобы починить сессию
                        local.setItem("firebaseIdToken", data.idToken);
                        
                    } else {
                        console.warn("Iframe тоже не нашел пользователя:", data.error);
                        local.removeItem("curr");
                        local.removeItem("firebaseIdToken");
                        local.removeItem("email");
                        local.removeItem("provider");
                        local.removeItem("isAdmin");
                        
                         const { auth } = await getFirebaseServices();
                        const user = AuthToken.getUser();

                        if (user) {
                            const sessionId = AuthToken.getSessionId();

                            if (sessionId) {
                                const appCheckToken = getAppCheckToken();

                                if (appCheckToken) {
                                    await removeSession(user.uid, sessionId, appCheckToken);
                                    console.log("[Logout] Backend session removed.");
                                } else {
                                    console.warn("[Logout] Failed to delete session on backend, App Check token missing.");
                                }
                            }
                        }

                        await signOut(auth);
                        $w("#html12").postMessage({ type: "LOGOUT_REQUEST" });
                        AuthToken.clear();
                        console.log("[Logout] Local storage has been cleared.");
                        // 2. Робимо редірект
                        local.setItem("closed_page", "true");
                        console.log("Redirecting to Log In...");
                        wixWindow.openLightbox("Log In");
                    }
                }
                // СЦЕНАРИЙ В: Просто обновление состояния (если айфрейм сам решил сообщить)
                else if (data.type === "AUTH_STATE_UPDATE" && data.user) {
                    console.log("Iframe сообщает, что юзер есть");
                    restoreSession(data.user, data.idToken);
                }
                });

                // 2. Сначала пробуем стандартный путь (как было у вас)
                html3.postMessage({ payload: "USER", config: config });

                // 3. ДОБАВЛЕНО: Через 1-2 секунды, если тишина, принудительно просим токен
                // Это страховка на случай, если "USER" вернет ошибку, мы попробуем "GET_FRESH_ID_TOKEN"
                setTimeout(() => {
                    console.log("Запрашиваем свежий токен принудительно...");
                    html3.postMessage({ type: "GET_FRESH_ID_TOKEN" });
                }, 1500);
            }

        }
    })

    // TEST
    $w('#buttonUpdate').onClick(async (event) => {
        $w("#buttonUpdate").disable()
        $w("#buttonUpdate").label = "Updating...";

        const inputName = $w("#inputName").value.trim();
        const inputInstagram = $w("#inputInstagram").value.trim();

        // Validation
        if (inputName && !validateString(inputName)) {
            $w("#buttonUpdate").enable()
            $w("#buttonUpdate").label = "Update Profile";

            return;
        }
        if(inputInstagram && !validateInstagramUrl(inputInstagram)) {
            $w("#buttonUpdate").enable()
            $w("#buttonUpdate").label = "Update Profile";
            $w("#inputInstagram").updateValidityIndication();
            console.log("UNValid instagram3")
            return;
        }

        try {
            //let idToken = local.getItem("firebaseIdToken");
            //if (!idToken) throw new Error("User is not authenticated.");
            let user = getAuth().currentUser;
            let idToken;

            if (user) {
                idToken = await user.getIdToken();
            } else {
                idToken = local.getItem("firebaseIdToken");
            }

            if (!idToken) {
                throw new Error("User is not authenticated (No token found).");
            }

            const dataToUpdate = {};
            if (inputName) dataToUpdate.displayName = inputName;
            if (inputInstagram) dataToUpdate.instagram = inputInstagram;

            if (Object.keys(dataToUpdate).length === 0) {
                $w("#buttonUpdate").enable()
                $w("#buttonUpdate").label = "Update Profile";
                return;
            }
            //const user = getAuth().currentUser;
            //idToken = await user.getIdToken();

            const response = await updateUserProfile(idToken, dataToUpdate, appCheckToken);

            if (response.success) {
                if (dataToUpdate.displayName) {
                    $w("#textName").text = dataToUpdate.displayName;
                }

                $w("#inputName").value = "";
                $w("#inputInstagram").value = inputInstagram || "";

                console.log("Data updated successfully!");
                $w("#updateSuccessful").show();
                $w("#updateSuccessful").expand();
                $w("#buttonUpdate").label = "Updated successfully!";
            } else {
                $w("#updateSuccessful").hide();
                $w("#updateSuccessful").collapse();
                throw new Error(response.error || "Update failed.");
            }

        } catch(error) {
            $w("#updateSuccessful").hide();
            $w("#updateSuccessful").collapse();
            console.error("Update failed:", error.message);
        } finally {
            $w("#buttonUpdate").enable()
            $w("#buttonUpdate").label = "Update Profile";
        }

    })
    // TEST

    // $w('#buttonUpdate').onClick(async (event) => {
    //     //go to Iframe
    //     const inputName = $w("#inputName").value;
    //     const inputInstagram = $w("#inputInstagram").value;

    //     if (inputName.trim().length !== 0 && !validateString(inputName) ) {
    //         return;
    //     }

    //     if(inputInstagram.trim() && !validateInstagramUrl(inputInstagram)) {
    //         // $w("#textError").text = "Please enter a valid Instagram URL (e.g., https://instagram.com/username).";
    //         // $w("#textError").expand();
    //         return;
    //     }


    //     try {
    //         if (imgIframe || nameIFrmae) {
    //             $w("#html3").postMessage({ payload: $w("#inputName").value, config });
    //             console.log("log after post message ", $w("#inputName").value)
    //             $w("#textName").text = $w("#inputName").value
    //             $w("#inputName").value = ""

    //         } else {
    //             updateProfile(auth.currentUser, {
    //                 displayName: $w("#inputName").value || auth.currentUser.displayName,
    //                 photoURL: url || auth.currentUser.photoURL
    //             }).then(() => {
    //                 // $w("#updateSuccessful").expand();

    //                 $w("#textName").text = $w("#inputName").value || auth.currentUser.displayName
    //                 $w("#inputName").value = ""
    //             }).catch(() => {
    //                 // $w("#updateUnsuccessful").expand();
    //             })
    //         }



    //         const token = local.getItem("firebaseIdToken");

    //         const dataToUpdate = {
    //             displayName: inputName,
    //             instagram: inputInstagram || "https://www.instagram.com/"
    //         }


    //         console.log("[buttonUpdate] token = ", token);
    //         console.log("[buttonUpdate] dataToUpdate = ", dataToUpdate);

    //         const userResponse = await updateUserProfile(token, dataToUpdate);

    //     } catch (err) {
    //         console.error("Update failed:", err.message);
    //         showError(err.message || "An error occurred.");
    //     } finally {
    //         $w("#buttonUpdate").enable().label = "Update Profile";
    //     }
        
    //     // send request to API to update user's extra fields (instagram)
    // })

    $w('#html2').onMessage((event) => {
        // console.log("event from iframe 2 ", event)
        if (infoCurrentUser) {
            // console.log("login normal")

            imageUrl = event.data

            const storage = getStorage();
            const metadata = {
                contentType: 'image/png'
            };

            const storageRef = ref(storage, '/avatars/' + currentUserFirebase + "/profile.png")

            var remoteimageurl = imageUrl

            fetch(remoteimageurl).then(res => {
                return res.blob();

            }).then(blob => {

                uploadBytes(storageRef, blob).then((snapshot) => {

                    getDownloadURL(storageRef).then((res) => {
                        updateProfile(auth.currentUser, {
                            displayName: $w("#inputName").value || auth.currentUser.displayName,
                            photoURL: res || auth.currentUser.photoURL
                        }).then(() => {
                            $w("#textName").text = $w("#inputName").value || auth.currentUser.displayName
                            $w("#inputName").value = ""
                            safeSetAvatar(res || auth.currentUser.photoURL)
                            //$w("#imageMain").src = res || auth.currentUser.photoURL
                        })

                    })

                })
            })
        } else {

            // console.log("login google face apple")
            imageUrl = event.data

            imageUrl
            fetch(imageUrl).then(res => {
                return res.blob();

            }).then(blob => {
                $w("#html3").postMessage({ payload: blob, config });

                $w("#html3").onMessage((event) => {
                    let received = event.data;

                    if (received) {
                        if (received.startsWith('URL')) {
                            let json = received.replace('URL:', '');
                            let obj = JSON.parse(json);
                            safeSetAvatar(obj)
                            //$w("#imageMain").src = obj

                        }
                    }

                });

            })
        }

    })

    $w('#button15').onClick((event) => {
        getAccess()
            .then((tok) => {
                if (tok.access_token) {
                    let token = tok.access_token;
                    cancelSubscription(token)
                }
            });
    })
});
