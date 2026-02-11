import { Switch, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { iosTransitionAnimation } from "@ionic/core";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import DashboardDesign from "@/pages/dashboard-design";
import Store from "@/pages/store";
import HowItWorks from "@/pages/how-it-works";
import Login from "@/pages/login";

function Router() {
  return (
    <IonReactRouter>
      <IonRouterOutlet animated animation={iosTransitionAnimation}>
        <Switch>
          <Route path="/store/:id" component={Store} />
          <Route
            exact
            path="/"
            render={() => (
              <Layout variant="default" showSellerNav>
                <Home />
              </Layout>
            )}
          />
          <Route
            path="/how-it-works"
            render={() => (
              <Layout variant="default" showSellerNav>
                <HowItWorks />
              </Layout>
            )}
          />
          <Route
            path="/login"
            render={() => (
              <Layout variant="default" showSellerNav>
                <Login />
              </Layout>
            )}
          />
          <Route
            path="/onboarding"
            render={() => (
              <Layout variant="default" showSellerNav>
                <Onboarding />
              </Layout>
            )}
          />
          <Route
            exact
            path="/dashboard"
            render={() => (
              <Layout variant="default" showSellerNav>
                <Dashboard />
              </Layout>
            )}
          />
          <Route
            path="/dashboard/design"
            render={() => (
              <Layout variant="default" showSellerNav>
                <DashboardDesign />
              </Layout>
            )}
          />
          <Route
            render={() => (
              <Layout variant="default" showSellerNav>
                <NotFound />
              </Layout>
            )}
          />
        </Switch>
      </IonRouterOutlet>
    </IonReactRouter>
  );
}

function App() {
  return (
    <IonApp>
      <QueryClientProvider client={queryClient}>
        <Router />
      </QueryClientProvider>
    </IonApp>
  );
}

export default App;
