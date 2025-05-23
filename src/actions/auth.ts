"use server";

const headers = {
  "Content-Type": "application/json",
  "Cache-Control": "no-cache",
  Accept: "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "User-Agent": "PostmanRuntime/7.43.3",
};

export const providerRegister = async (formData: any) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/provider/register`;

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(formData),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        errors: data.errors || { general: ["Registration failed"] },
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      errors: {
        general: ["An unexpected error occurred. Please try again later."],
      },
    };
  }
};

export const userRegister = async (formData: any) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/user/register`;

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(formData),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        errors: data.errors || { general: ["Registration failed"] },
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("User registration error:", error);
    return {
      success: false,
      errors: {
        general: ["An unexpected error occurred. Please try again later."],
      },
    };
  }
};

export const multiLogin = async (formData: {
  email: string;
  password: string;
}) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/login`;

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(formData),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || ` authentication failed`,
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error(` login error:`, error);
    return {
      success: false,
      errors: {
        general: ["An unexpected error occurred. Please try again later."],
      },
    };
  }
};
export const logout = async () => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/user/logout`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        errors: data.errors || { general: ["Logout failed"] },
      };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      errors: {
        general: ["An unexpected error occurred. Please try again later."],
      },
    };
  }
};
