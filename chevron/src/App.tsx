import { Router, Route } from '@solidjs/router';
import { Login } from '@features/login';
import { Budget } from '@features/budget';
import { Subscriptions } from '@features/subscriptions';
import { Layout } from '@features/layout';

const App = () => {
    return (
        <Router>
            <Route path="/login" component={Login} />
            <Route path="/" component={Login} />
            <Route path="/app" component={Layout}>
                <Route path="/dashboard" component={Budget} />
                <Route path="/subscriptions" component={Subscriptions} />
                <Route path="/settings" component={() => null} />
            </Route>
        </Router>
    );
};

export default App;
