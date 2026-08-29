import { mailBody } from "@/utils/constants";
import { MailtrapClient } from "mailtrap";

const mailtrap= new MailtrapClient({ 
  token: process.env.MAILTRAP_API_KEY as string,  // You can create your API key here https://mailtrap.io/settings/api-tokens
});

mailtrap
  .send(mailBody)
  .then(console.log)
  .catch(console.error);