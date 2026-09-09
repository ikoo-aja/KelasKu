/* ===== KelasKu — autentikasi & session ===== */
const Auth = {
  user() {
    try {
      return JSON.parse(sessionStorage.getItem("kelas_session"));
    } catch {
      return null;
    }
  },
  async login(username, password) {
    const users = Store.get("users");
    const user = users.find((u) => u.username === username);
    if (!user) return null;
    const hash = await Utils.sha256(password);
    if (hash !== user.passwordHash) return null;
    sessionStorage.setItem("kelas_session", JSON.stringify(user));
    return user;
  },
  logout() {
    sessionStorage.removeItem("kelas_session");
    location.hash = "";
    App.renderLogin();
  },
  isAdmin() {
    return this.user()?.role === "admin_guru";
  },
};
