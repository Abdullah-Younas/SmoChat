import { Auth } from './components/Auth';
import {MainPage} from './components/Main';
import {Land} from './components/Land';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className='Background'>
      <Router>
        <Routes>
          <Route path='/' element={<Land/>} />
          <Route path='/auth' element={<Auth />} />
          <Route path='/success' element={<MainPage/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
