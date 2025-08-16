import { Router, Route } from '@solidjs/router';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Subscriptions from './components/Subscriptions';
import Layout from './components/Layout';

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
