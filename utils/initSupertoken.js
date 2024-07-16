import supertokens from "supertokens-node";
import Session from "supertokens-node/recipe/session/index.js";
import EmailPassword from "supertokens-node/recipe/emailpassword/index.js";
import ThirdParty from "supertokens-node/recipe/thirdparty/index.js";
import EmailVerification from "supertokens-node/recipe/emailverification/index.js";
import AccountLinking from "supertokens-node/recipe/accountlinking/index.js";;

const initSuperToken = () => { //initializing supertoken
  supertokens.init({
    framework: "express",
    supertokens: {
      connectionURI: process.env.SUPERTOKENCONNECTIONURI,
      apiKey: process.env.SUPERTOKENAPIKEY,
    },
    appInfo: {
      appName: process.env.APPNAME,
      apiDomain: process.env.APIDOMAIN,
      websiteDomain: process.env.FEDOMAIN,
      apiBasePath: "/auth",
      websiteBasePath: "/auth",
    },
    recipeList: [
      AccountLinking.init({
            shouldDoAutomaticAccountLinking: async (newAccountInfo, user, session, tenantId, userContext) => {
                if (session !== undefined) {
                    return {
                        shouldAutomaticallyLink: false
                    }
                }
                if (newAccountInfo.recipeUserId !== undefined && user !== undefined) {
                    let userId = newAccountInfo.recipeUserId.getAsString();
                    let hasInfoAssociatedWithUserId = false
                    if (hasInfoAssociatedWithUserId) {
                        return {
                            shouldAutomaticallyLink: false
                        }
                    }
                }
                return {
                    shouldAutomaticallyLink: true,
                    shouldRequireVerification: true
                }
            }
        }),
      EmailPassword.init(),
      EmailVerification.init({
        // mode: "REQUIRED", // or "OPTIONAL"     Need to change to required when the email is validated 
      }),
      ThirdParty.init({
        signInAndUpFeature: {
          providers: [
            {
              config: {
                thirdPartyId: "google",
                clients: [
                  {
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                  },
                ],
              },
            },
          ],
        },
      }),
      Session.init({
        exposeAccessTokenToFrontendInCookieBasedAuth: true,
      }),
    ],
  });
};


export default initSuperToken;