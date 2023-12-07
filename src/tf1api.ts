import { createUserParams } from "./utils";

const tf1AccountUrl = "https://compte.tf1.fr";

export const getRegToken = async () => {
  const newUrl = new URL(tf1AccountUrl);

  newUrl.pathname = "/accounts.initRegistration";
  newUrl.searchParams.append("APIKey", Bun.env.TF1_API_KEY!);

  try {
    const response = await fetch(newUrl);
    const json = await response.json();
    return json.regToken;
  } catch (error) {
    console.error(error);
    console.error("Error while getting regToken");
  }
};

export const registerAccount = async (email: string, regToken: string) => {
  const newUrl = new URL(tf1AccountUrl);

  newUrl.pathname = "/accounts.register";

  try {
    const response = await fetch(newUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: await createUserParams(email, regToken),
    });

    const json = await response.json();

    if (json.statusCode >= 400) {
      throw new Error(json.error);
    }

    console.info("Registered account");
    return json;
  } catch (error) {
    console.error(error);
    console.error("Error while registering account");
  }
};
