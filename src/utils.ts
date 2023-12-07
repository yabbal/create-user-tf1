import { SexType, fakerFR as faker, fakerEN } from "@faker-js/faker";

import { Mailsac } from "@mailsac/api";

export const mailsac = new Mailsac({
  headers: {
    "Mailsac-Key": Bun.env.MAILSAC_API_KEY,
    "Accept-Encoding": "gzip",
  },
});

export const resetAllEmail = async () => {
  try {
    const mailList = await mailsac.addresses.listAddresses();
    mailList.data.forEach(async (mail) => {
      if (mail._id) {
        try {
          await mailsac.addresses.deleteAddress(mail._id);
        } catch (error) {
          console.error(error);
          console.error(`Error while deleting email: ${mail._id}`);
        }
      }
    });

    console.info("Reset all email");
  } catch (error) {
    console.error(error);
    console.error("Error while resetting all email");
  }
};

export const createEmail = async (email: string) => {
  try {
    const isEmailAvailable = await mailsac.addresses.checkAvailability(email);

    if (!isEmailAvailable.data.available) {
      throw new Error(`Email already exists: ${email}`);
    }

    await mailsac.addresses.createAddress(email);
    console.info(`Created new email: ${email}`);
  } catch (error) {
    console.error(`Error while creating new email: ${email}`);
    throw error;
  }
};

export const clickConfirmationLink = async (email: string) => {
  try {
    const listMail = await mailsac.messages.listMessages(email);

    await fetch(listMail.data.at(0)?.links?.at(2)!);
    console.log("Clicked on confirmation link");
  } catch (error) {
    console.error(error);
    console.error("Error while clicking on confirmation link");
  }
};

export const waitForEmail = async (email: string) => {
  while (true) {
    const receivedMail = await mailsac.messages.countMessages(email);

    if (receivedMail.data.count! > 0) {
      console.log("Email received");
      break;
    }
    console.log("Waiting for email...");
    console.log(receivedMail.data.count);
    await Bun.sleep(1000);
  }
};

export const generateHash = async (email: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(email);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
};

export const createUserParams = async (email: string, regToken: string) => {
  const gender = fakerEN.person.sex() as SexType;
  const firstName = faker.person.firstName(gender);
  const zip = faker.location.zipCode();
  const birthdate = faker.date.birthdate();

  const birthDay = birthdate.getDate();
  const birthMonth = birthdate.getMonth() + 1;
  const birthYear = birthdate.getFullYear();

  const urlParams = {
    APIKey: Bun.env.TF1_API_KEY!,
    regToken,
    email: email,
    password: "Password2023!",
    profile: {
      firstName,
      zip,
      birthDay,
      birthMonth,
      birthYear,
      gender: gender.charAt(0),
    },
    preferences: {
      optinActuTF1: { isConsentGranted: true },
      optinGroup: { isConsentGranted: true },
      optinPartner: { isConsentGranted: true },
      privacy: { privacyTF1: { isConsentGranted: true } },
      terms: { termsTF1: { isConsentGranted: true } },
    },
    data: {
      myTf1: {
        createdAt: new Date().toISOString(),
        registrationOrigin: {
          service: "web",
          serviceType: "monCompte",
          serviceId: "monCompte",
        },
      },
      hashEmail: await generateHash(email),
    },
    finalizeRegistration: "true",
  };

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(urlParams)) {
    if (typeof value !== "object") {
      params.append(key, value);
    } else {
      params.append(key, JSON.stringify(value));
    }
  }

  return params;
};
