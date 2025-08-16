import { Router, Route } from '@solidjs/router';
import { Login } from '@features/login';
import { Dashboard } from '@features/dashboard';
import { Subscriptions } from '@features/subscriptions';
import { Layout } from '@features/layout';

const App = () => {
    return (
        <Router>
            <Route path="/login" component={Login} />
            <Route path="/" component={Login} />
            <Route path="/app" component={Layout}>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/subscriptions" component={Subscriptions} />
                <Route path="/settings" component={() => null} />
            </Route>
        </Router>
    );
};

export default App;
