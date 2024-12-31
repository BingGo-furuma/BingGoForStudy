export const mockApi = {
    login: async (email, password) => {
        // ダミーのログイン成功データ
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === "test@example.com" && password === "password") {
                    resolve({
                        access: "mock_access_token",
                        refresh: "mock_refresh_token",
                    });
                } else {
                    reject(new Error("Invalid credentials"));
                }
            }, 1000); // ダミーの遅延
        });
    },
};
