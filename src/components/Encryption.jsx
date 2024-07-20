import crypto from "crypto-js";
const secretKey = "tu@57sWjudV679e";
function store(userObject) {
  const encryptedObject = crypto.AES.encrypt(
    JSON.stringify(userObject),
    secretKey
  ).toString();
  localStorage.setItem("jwt", encryptedObject);
}

function retrieve() {
  const decryptObject = localStorage.getItem("jwt");

  if (decryptObject) {
    const obj = crypto.AES.decrypt(decryptObject, secretKey).toString(
      crypto.enc.Utf8
    );
    // console.log(obj)
    return JSON.parse(obj);
  }
  return null;
}

function remove() {
  if (localStorage.getItem("jwt")) {
    localStorage.removeItem("jwt");
  }
}

export { store, retrieve, remove };