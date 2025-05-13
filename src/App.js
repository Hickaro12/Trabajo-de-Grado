import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Map3D from './components/Map3D';
import TresCruces from './components/TresCruces'; // ✅ Importamos directamente
import MainLayout from './layouts/MainLayout.js';
import QuizSelector from './components/QuizSelector'; // Nuevo import
import Quiz from './components/Quiz';
import SanAntonio from './components/SanAntonio.jsx'; // nombre del archivo que creamos
import Gatos from './components/gatos.jsx'
import Tertulia from './components/tertulia.jsx';
import Bulevard from './components/bulevard.jsx';



const App = () => {
  return (
    <Router>
      <Routes>
        {/* ✅ Login y Register sin Navbar */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ Map3D con Navbar */}
        <Route
          path="/map"
          element={
            <MainLayout>
              <Map3D />
            </MainLayout>
          }
        />

        <Route
          path="/quiz"
          element={
            <MainLayout>
              <QuizSelector />
            </MainLayout>
          }
        />
        <Route
          path="/quiz/:dificultad"
          element={
            <MainLayout>
              <Quiz />
            </MainLayout>
          }
        />
        <Route
          path="/gatos"
          element={
            <MainLayout>
              <Gatos />
            </MainLayout>
          }
        />


        {/* ✅ Tres Cruces con Navbar */}
        <Route
          path="/tres-cruces"
          element={
            <MainLayout>
              <TresCruces />
            </MainLayout>
          }
        />
        <Route
          path="/san-antonio"
          element={
            <MainLayout>
              <SanAntonio />
            </MainLayout>
          }
        />

        <Route
          path="/tertulia"
          element={
            <MainLayout>
              <Tertulia />
            </MainLayout>
          }

        />

        <Route
          path="/bulevard"
          element={
            <MainLayout>
              <Bulevard />
            </MainLayout>
          }
        />

      </Routes>



    </Router>
  );
};

export default App;
