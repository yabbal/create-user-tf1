import { fakerFR as faker } from "@faker-js/faker";
import {
  clickConfirmationLink,
  createEmail,
  resetAllEmail,
  waitForEmail,
} from "../src/utils";
import { getRegToken, registerAccount } from "../src/tf1api";

await resetAllEmail();

const randomEmail = faker.internet
  .email({
    provider: "mailsac.com",
  })
  .toLowerCase();

await createEmail(randomEmail);

const regToken = await getRegToken();
await registerAccount(randomEmail, regToken);

await Bun.sleep(5000);

await waitForEmail(randomEmail);

await clickConfirmationLink(randomEmail);

console.info("New account created");
console.table({
  email: randomEmail,
  password: "Password2023!",
});
