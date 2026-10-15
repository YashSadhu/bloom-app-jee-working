import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Text,
  TouchableOpacity
} from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { toast } from 'sonner-native';
import { 
  DashboardHeader, 
  SearchBar, 
  SubjectTabs, 
  ChapterList,
  DashboardFooter,
  DashboardBackground,
  CheckedTopicsModal,
  GenerateTestModal
} from '../components/dashboard';
import { Subject, SubjectTab } from '../components/dashboard/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* eslint-disable no-undef */
/* global fetch */

// @ts-ignore

// Define the structure for our syllabus data
interface SubTopic {
  id: string;
  name: string;
  checked: boolean;
}

interface Topic {
  id: string;
  name: string;
  checked: boolean;
  subTopics: SubTopic[];
  expanded?: boolean;
}

interface Chapter {
  id: string;
  name: string;
  checked: boolean;
  topics: Topic[];
  expanded: boolean;
}

interface Subject {
  id: string;
  name: string;
  checked: boolean;
  chapters: Chapter[];
}

export default function StudyDashboard() {
  const navigation = useNavigation();
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubject, setActiveSubject] = useState('chemistry');
  const [showCheckedTopics, setShowCheckedTopics] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState('10');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Initialize syllabus data
  const [syllabusData, setSyllabusData] = useState<Subject[]>([
    {
      id: 'chemistry',
      name: 'CHEMISTRY',
      checked: false,
      chapters: [
        {
          id: 'chem-general',
          name: 'General Topics',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'chem-general-1',
              name: 'Concept of atoms and molecules',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-general-1-1', name: "Dalton's atomic theory", checked: false },
                { id: 'chem-general-1-2', name: 'Mole concept', checked: false },
                { id: 'chem-general-1-3', name: 'Chemical formulae', checked: false },
                { id: 'chem-general-1-4', name: 'Balanced chemical equations', checked: false },
              ]
            },
            {
              id: 'chem-general-2',
              name: 'Calculations based on mole concept and stoichiometry',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-general-2-1', name: "Oxidation-reduction reactions", checked: false },
                { id: 'chem-general-2-2', name: "Neutralisation reactions", checked: false },
                { id: 'chem-general-2-3', name: "Displacement reactions", checked: false },
              ]
            },
            {
              id: 'chem-general-3',
              name: 'Concentration',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-general-3-1', name: "Mole fraction", checked: false },
                { id: 'chem-general-3-2', name: "Molarity", checked: false },
                { id: 'chem-general-3-3', name: "Molality", checked: false },
                { id: 'chem-general-3-4', name: "Normality", checked: false },
              ]
            },
          ]
        },
        {
          id: 'chem-states-matter',
          name: 'States of Matter: Gases and Liquids',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'chem-states-1',
              name: 'Gas laws and ideal gas equation',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-states-1-1', name: "Absolute scale of temperature", checked: false },
                { id: 'chem-states-1-2', name: 'Deviation from ideality', checked: false },
                { id: 'chem-states-1-3', name: 'van der Waals equation', checked: false },
              ]
            },
            {
              id: 'chem-states-2',
              name: 'Kinetic theory of gases',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-states-2-1', name: "Average, root mean square and most probable velocities", checked: false },
                { id: 'chem-states-2-2', name: "Relation with temperature", checked: false },
                { id: 'chem-states-2-3', name: "Law of partial pressures", checked: false },
                { id: 'chem-states-2-4', name: "Diffusion of gases", checked: false },
              ]
            },
            {
              id: 'chem-states-3',
              name: 'Intermolecular interactions',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-states-3-1', name: "Types of interactions", checked: false },
                { id: 'chem-states-3-2', name: "Distance dependence", checked: false },
                { id: 'chem-states-3-3', name: "Effect on properties", checked: false },
              ]
            },
            {
              id: 'chem-states-4',
              name: 'Liquids',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-states-4-1', name: "Vapour pressure", checked: false },
                { id: 'chem-states-4-2', name: "Surface tension", checked: false },
                { id: 'chem-states-4-3', name: "Viscosity", checked: false },
              ]
            },
          ]
        },
        {
          id: 'chem-atomic-structure',
          name: 'Atomic Structure',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'chem-atomic-1',
              name: 'Bohr model',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-atomic-1-1', name: "Spectrum of hydrogen atom", checked: false },
              ]
            },
            {
              id: 'chem-atomic-2',
              name: 'Wave-particle duality',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-atomic-2-1', name: "de Broglie hypothesis", checked: false },
                { id: 'chem-atomic-2-2', name: "Uncertainty principle", checked: false },
              ]
            },
            {
              id: 'chem-atomic-3',
              name: 'Quantum mechanical picture of hydrogen atom',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-atomic-3-1', name: "Energies and quantum numbers", checked: false },
                { id: 'chem-atomic-3-2', name: "Wave function and probability density", checked: false },
                { id: 'chem-atomic-3-3', name: "Shapes of s, p and d orbitals", checked: false },
              ]
            },
            {
              id: 'chem-atomic-4',
              name: 'Electron configuration principles',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-atomic-4-1', name: "Aufbau principle", checked: false },
                { id: 'chem-atomic-4-2', name: "Pauli's exclusion principle", checked: false },
                { id: 'chem-atomic-4-3', name: "Hund's rule", checked: false },
              ]
            },
          ]
        },
        {
          id: 'chem-bonding',
          name: 'Chemical Bonding and Molecular Structure',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'chem-bonding-1',
              name: 'Covalent bonding',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-bonding-1-1', name: "Orbital overlap", checked: false },
                { id: 'chem-bonding-1-2', name: "Hybridisation involving s, p and d orbitals", checked: false },
              ]
            },
            {
              id: 'chem-bonding-2',
              name: 'Molecular orbital theory',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-bonding-2-1', name: "Energy diagrams for homonuclear diatomic species", checked: false },
                { id: 'chem-bonding-2-2', name: "Up to Ne₂", checked: false },
              ]
            },
            {
              id: 'chem-bonding-3',
              name: 'Other bonding concepts',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-bonding-3-1', name: "Hydrogen bond", checked: false },
                { id: 'chem-bonding-3-2', name: "Polarity in molecules", checked: false },
                { id: 'chem-bonding-3-3', name: "Dipole moment", checked: false },
              ]
            },
            {
              id: 'chem-bonding-4',
              name: 'VSEPR model',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-bonding-4-1', name: "Linear and angular shapes", checked: false },
                { id: 'chem-bonding-4-2', name: "Triangular and square planar shapes", checked: false },
                { id: 'chem-bonding-4-3', name: "Pyramidal and square pyramidal shapes", checked: false },
                { id: 'chem-bonding-4-4', name: "Trigonal bipyramidal shape", checked: false },
                { id: 'chem-bonding-4-5', name: "Tetrahedral and octahedral shapes", checked: false },
              ]
            },
          ]
        },
        {
          id: 'chem-thermodynamics',
          name: 'Chemical Thermodynamics',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'chem-thermo-1',
              name: 'Basic concepts',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-thermo-1-1', name: "Intensive and extensive properties", checked: false },
                { id: 'chem-thermo-1-2', name: "State functions", checked: false },
              ]
            },
            {
              id: 'chem-thermo-2',
              name: 'First law of thermodynamics',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-thermo-2-1', name: "Internal energy", checked: false },
                { id: 'chem-thermo-2-2', name: "Work (pressure-volume only)", checked: false },
                { id: 'chem-thermo-2-3', name: "Heat", checked: false },
              ]
            },
            {
              id: 'chem-thermo-3',
              name: 'Enthalpy',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-thermo-3-1', name: "Heat capacity", checked: false },
                { id: 'chem-thermo-3-2', name: "Standard state", checked: false },
                { id: 'chem-thermo-3-3', name: "Hess's law", checked: false },
                { id: 'chem-thermo-3-4', name: "Enthalpy of reaction", checked: false },
                { id: 'chem-thermo-3-5', name: "Enthalpy of fusion and vaporization", checked: false },
                { id: 'chem-thermo-3-6', name: "Lattice enthalpy", checked: false },
              ]
            },
            {
              id: 'chem-thermo-4',
              name: 'Second law of thermodynamics',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-thermo-4-1', name: "Entropy", checked: false },
                { id: 'chem-thermo-4-2', name: "Gibbs energy", checked: false },
                { id: 'chem-thermo-4-3', name: "Criteria of equilibrium and spontaneity", checked: false },
              ]
            },
          ]
        },
        {
          id: 'chem-equilibrium',
          name: 'Chemical and Ionic Equilibrium',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'chem-equil-1',
              name: 'Law of mass action',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-equil-1-1', name: "Significance of ΔG and ΔG° in chemical equilibrium", checked: false },
                { id: 'chem-equil-1-2', name: "Equilibrium constant (Kp and Kc)", checked: false },
                { id: 'chem-equil-1-3', name: "Reaction quotient", checked: false },
              ]
            },
            {
              id: 'chem-equil-2',
              name: "Le Chatelier's principle",
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-equil-2-1', name: "Effect of concentration", checked: false },
                { id: 'chem-equil-2-2', name: "Effect of temperature", checked: false },
                { id: 'chem-equil-2-3', name: "Effect of pressure", checked: false },
              ]
            },
            {
              id: 'chem-equil-3',
              name: 'Ionic equilibrium',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-equil-3-1', name: "Solubility product", checked: false },
                { id: 'chem-equil-3-2', name: "Common ion effect", checked: false },
                { id: 'chem-equil-3-3', name: "pH and buffer solutions", checked: false },
              ]
            },
            {
              id: 'chem-equil-4',
              name: 'Acid-base concepts',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-equil-4-1', name: "Brønsted concept", checked: false },
                { id: 'chem-equil-4-2', name: "Lewis concept", checked: false },
                { id: 'chem-equil-4-3', name: "Hydrolysis of salts", checked: false },
              ]
            },
          ]
        },
        {
          id: 'chem-electrochemistry',
          name: 'Electrochemistry',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'chem-electro-1',
              name: 'Electrochemical cells',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-electro-1-1', name: "Cell reactions", checked: false },
                { id: 'chem-electro-1-2', name: "Standard electrode potentials", checked: false },
                { id: 'chem-electro-1-3', name: "Electrochemical work", checked: false },
                { id: 'chem-electro-1-4', name: "Nernst equation", checked: false },
              ]
            },
            {
              id: 'chem-electro-2',
              name: 'Electrochemical series',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-electro-2-1', name: "EMF of galvanic cells", checked: false },
              ]
            },
            {
              id: 'chem-electro-3',
              name: 'Electrolysis',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-electro-3-1', name: "Faraday's laws", checked: false },
                { id: 'chem-electro-3-2', name: "Electrolytic conductance", checked: false },
                { id: 'chem-electro-3-3', name: "Specific, equivalent and molar conductivity", checked: false },
                { id: 'chem-electro-3-4', name: "Kohlrausch's law", checked: false },
              ]
            },
            {
              id: 'chem-electro-4',
              name: 'Applications',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-electro-4-1', name: "Primary batteries", checked: false },
                { id: 'chem-electro-4-2', name: "Secondary batteries", checked: false },
                { id: 'chem-electro-4-3', name: "Fuel cells", checked: false },
                { id: 'chem-electro-4-4', name: "Corrosion", checked: false },
              ]
            },
          ]
        },
        {
          id: 'chem-kinetics',
          name: 'Chemical Kinetics',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'chem-kinetics-1',
              name: 'Rates of chemical reactions',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-kinetics-1-1', name: "Order and molecularity of reactions", checked: false },
                { id: 'chem-kinetics-1-2', name: "Rate law and rate constant", checked: false },
                { id: 'chem-kinetics-1-3', name: "Half-life", checked: false },
              ]
            },
            {
              id: 'chem-kinetics-2',
              name: 'Rate expressions',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-kinetics-2-1', name: "Differential rate expressions for zero order", checked: false },
                { id: 'chem-kinetics-2-2', name: "Differential rate expressions for first order", checked: false },
                { id: 'chem-kinetics-2-3', name: "Integrated rate expressions for zero order", checked: false },
                { id: 'chem-kinetics-2-4', name: 'Integrated rate expressions for first order', checked: false },
              ]
            },
            {
              id: 'chem-kinetics-3',
              name: 'Temperature dependence',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-kinetics-3-1', name: "Arrhenius equation", checked: false },
                { id: 'chem-kinetics-3-2', name: "Activation energy", checked: false },
              ]
            },
            {
              id: 'chem-kinetics-4',
              name: 'Catalysis',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-kinetics-4-1', name: "Homogeneous catalysis", checked: false },
                { id: 'chem-kinetics-4-2', name: "Heterogeneous catalysis", checked: false },
                { id: 'chem-kinetics-4-3', name: "Activity and selectivity of solid catalysts", checked: false },
                { id: 'chem-kinetics-4-4', name: "Enzyme catalysis and its mechanism", checked: false },
              ]
            },
          ]
        },
        {
          id: 'chem-solid-state',
          name: 'Solid State',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'chem-solid-1',
              name: 'Classification of solids',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-solid-1-1', name: "Crystalline state", checked: false },
                { id: 'chem-solid-1-2', name: "Seven crystal systems", checked: false },
                { id: 'chem-solid-1-3', name: "Cell parameters a, b, c, α, β, γ", checked: false },
              ]
            },
            {
              id: 'chem-solid-2',
              name: 'Close packed structures',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-solid-2-1', name: "Cubic close packing", checked: false },
                { id: 'chem-solid-2-2', name: "Hexagonal close packing", checked: false },
                { id: 'chem-solid-2-3', name: "Packing in fcc lattice", checked: false },
                { id: 'chem-solid-2-4', name: "Packing in bcc lattice", checked: false },
                { id: 'chem-solid-2-5', name: "Packing in hcp lattice", checked: false },
              ]
            },
            {
              id: 'chem-solid-3',
              name: 'Crystal properties',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'chem-solid-3-1', name: "Nearest neighbors", checked: false },
                { id: 'chem-solid-3-2', name: "Ionic radii", checked: false },
                { id: 'chem-solid-3-3', name: "Radius ratio", checked: false },
                { id: 'chem-solid-3-4', name: "Point defects", checked: false },
              ]
            },
          ]
        },
      ]
    },
    {
      id: 'physics',
      name: 'PHYSICS',
      checked: false,
      chapters: [
        {
          id: 'physics-general',
          name: 'General',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'physics-general-1',
              name: 'Units and dimensions',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-general-1-1', name: "Dimensional analysis", checked: false },
                { id: 'physics-general-1-2', name: "Least count, significant figures", checked: false },
              ]
            },
            {
              id: 'physics-general-2',
              name: 'Methods of measurement and error analysis',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-general-2-1', name: "Vernier calipers and screw gauge experiments", checked: false },
                { id: 'physics-general-2-2', name: "Determination of g using simple pendulum", checked: false },
                { id: 'physics-general-2-3', name: "Young's modulus - elasticity of material", checked: false },
                { id: 'physics-general-2-4', name: "Surface tension of water by capillary rise", checked: false },
                { id: 'physics-general-2-5', name: "Specific heat of liquid using calorimeter", checked: false },
                { id: 'physics-general-2-6', name: "Focal length determination using u-v method", checked: false },
                { id: 'physics-general-2-7', name: "Speed of sound using resonance column", checked: false },
                { id: 'physics-general-2-8', name: "Verification of Ohm's law", checked: false },
                { id: 'physics-general-2-9', name: "Specific resistance using meter bridge", checked: false },
              ]
            },
          ]
        },
        {
          id: 'physics-mechanics',
          name: 'Mechanics',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'physics-mechanics-1',
              name: 'Kinematics',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-mechanics-1-1', name: "One and two dimensions (Cartesian coordinates)", checked: false },
                { id: 'physics-mechanics-1-2', name: "Projectiles", checked: false },
                { id: 'physics-mechanics-1-3', name: "Uniform circular motion", checked: false },
                { id: 'physics-mechanics-1-4', name: "Relative velocity", checked: false },
              ]
            },
            {
              id: 'physics-mechanics-2',
              name: "Newton's laws of motion",
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-mechanics-2-1', name: "Inertial and uniformly accelerated frames", checked: false },
                { id: 'physics-mechanics-2-2', name: "Static and dynamic friction", checked: false },
                { id: 'physics-mechanics-2-3', name: "Kinetic and potential energy", checked: false },
                { id: 'physics-mechanics-2-4', name: "Work and power", checked: false },
                { id: 'physics-mechanics-2-5', name: "Conservation of linear momentum and energy", checked: false },
              ]
            },
            {
              id: 'physics-mechanics-3',
              name: 'Systems of particles',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-mechanics-3-1', name: "Centre of mass and its motion", checked: false },
                { id: 'physics-mechanics-3-2', name: "Impulse", checked: false },
                { id: 'physics-mechanics-3-3', name: "Elastic and inelastic collisions", checked: false },
              ]
            },
            {
              id: 'physics-mechanics-4',
              name: 'Rigid body dynamics',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-mechanics-4-1', name: "Moment of inertia", checked: false },
                { id: 'physics-mechanics-4-2', name: "Parallel axes theorem", checked: false },
                { id: 'physics-mechanics-4-3', name: "Perpendicular axes theorem", checked: false },
                { id: 'physics-mechanics-4-4', name: "Moment of inertia of uniform bodies with simple geometrical shapes", checked: false },
                { id: 'physics-mechanics-4-5', name: "Angular momentum", checked: false },
                { id: 'physics-mechanics-4-6', name: "Torque", checked: false },
                { id: 'physics-mechanics-4-7', name: "Conservation of angular momentum", checked: false },
                { id: 'physics-mechanics-4-8', name: "Dynamics of rigid bodies with fixed axis of rotation", checked: false },
                { id: 'physics-mechanics-4-9', name: "Rolling without slipping of rings, cylinders and spheres", checked: false },
                { id: 'physics-mechanics-4-10', name: "Equilibrium of rigid bodies", checked: false },
                { id: 'physics-mechanics-4-11', name: "Collision of point masses with rigid bodies", checked: false },
              ]
            },
            {
              id: 'physics-mechanics-5',
              name: 'Oscillations',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-mechanics-5-1', name: "Forced oscillation", checked: false },
                { id: 'physics-mechanics-5-2', name: "Damped oscillation", checked: false },
                { id: 'physics-mechanics-5-3', name: "Resonance", checked: false },
                { id: 'physics-mechanics-5-4', name: "Linear simple harmonic motion", checked: false },
                { id: 'physics-mechanics-5-5', name: "Angular simple harmonic motion", checked: false },
              ]
            },
            {
              id: 'physics-mechanics-6',
              name: "Hooke's law and elasticity",
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-mechanics-6-1', name: "Young's modulus", checked: false },
              ]
            },
            {
              id: 'physics-mechanics-7',
              name: 'Gravitation',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-mechanics-7-1', name: "Law of gravitation", checked: false },
                { id: 'physics-mechanics-7-2', name: "Gravitational potential and field", checked: false },
                { id: 'physics-mechanics-7-3', name: "Acceleration due to gravity", checked: false },
                { id: 'physics-mechanics-7-4', name: "Kepler's law", checked: false },
                { id: 'physics-mechanics-7-5', name: "Geostationary orbits", checked: false },
                { id: 'physics-mechanics-7-6', name: "Motion of planets and satellites in circular orbits", checked: false },
                { id: 'physics-mechanics-7-7', name: "Escape velocity", checked: false },
              ]
            },
            {
              id: 'physics-mechanics-8',
              name: 'Fluid mechanics',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-mechanics-8-1', name: "Pressure in a fluid", checked: false },
                { id: 'physics-mechanics-8-2', name: "Pascal's law", checked: false },
                { id: 'physics-mechanics-8-3', name: "Buoyancy", checked: false },
                { id: 'physics-mechanics-8-4', name: "Surface energy and surface tension", checked: false },
                { id: 'physics-mechanics-8-5', name: "Angle of contact, drops, bubbles and capillary rise", checked: false },
                { id: 'physics-mechanics-8-6', name: "Viscosity", checked: false },
                { id: 'physics-mechanics-8-7', name: "Modulus of rigidity and bulk modulus", checked: false },
                { id: 'physics-mechanics-8-8', name: "Stoke's law and terminal velocity", checked: false },
                { id: 'physics-mechanics-8-9', name: "Streamline flow and equation of continuity", checked: false },
                { id: 'physics-mechanics-8-10', name: "Bernoulli's theorem and its applications", checked: false },
              ]
            },
            {
              id: 'physics-mechanics-9',
              name: 'Wave motion',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-mechanics-9-1', name: "Plane waves (longitudinal and transverse)", checked: false },
                { id: 'physics-mechanics-9-2', name: "Superposition of waves", checked: false },
                { id: 'physics-mechanics-9-3', name: "Progressive and stationary waves", checked: false },
                { id: 'physics-mechanics-9-4', name: "Vibration of strings and air columns", checked: false },
                { id: 'physics-mechanics-9-5', name: "Resonance", checked: false },
                { id: 'physics-mechanics-9-6', name: "Beats", checked: false },
                { id: 'physics-mechanics-9-7', name: "Speed of sound in gases", checked: false },
                { id: 'physics-mechanics-9-8', name: "Doppler effect in sound", checked: false },
              ]
            },
          ]
        },
        {
          id: 'physics-thermal',
          name: 'Thermal Physics',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'physics-thermal-1',
              name: 'Thermal properties',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-thermal-1-1', name: "Thermal expansion of solids", checked: false },
                { id: 'physics-thermal-1-2', name: "Thermal expansion of liquids", checked: false },
                { id: 'physics-thermal-1-3', name: "Thermal expansion of gases", checked: false },
              ]
            },
            {
              id: 'physics-thermal-2',
              name: 'Calorimetry',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-thermal-2-1', name: "Latent heat", checked: false },
                { id: 'physics-thermal-2-2', name: "Heat conduction in one dimension", checked: false },
              ]
            },
            {
              id: 'physics-thermal-3',
              name: 'Heat transfer',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-thermal-3-1', name: "Elementary concepts of convection", checked: false },
                { id: 'physics-thermal-3-2', name: "Elementary concepts of radiation", checked: false },
                { id: 'physics-thermal-3-3', name: "Newton's law of cooling", checked: false },
              ]
            },
            {
              id: 'physics-thermal-4',
              name: 'Gas laws',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-thermal-4-1', name: "Ideal gas laws", checked: false },
                { id: 'physics-thermal-4-2', name: "Specific heats (Cv and Cp for monoatomic gases)", checked: false },
                { id: 'physics-thermal-4-3', name: "Specific heats (Cv and Cp for diatomic gases)", checked: false },
                { id: 'physics-thermal-4-4', name: "Isothermal processes", checked: false },
                { id: 'physics-thermal-4-5', name: "Adiabatic processes", checked: false },
                { id: 'physics-thermal-4-6', name: "Bulk modulus of gases", checked: false },
              ]
            },
            {
              id: 'physics-thermal-5',
              name: 'Thermodynamics',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-thermal-5-1', name: "Equivalence of heat and work", checked: false },
                { id: 'physics-thermal-5-2', name: "First law of thermodynamics", checked: false },
                { id: 'physics-thermal-5-3', name: "Applications of first law (ideal gases)", checked: false },
                { id: 'physics-thermal-5-4', name: "Second law of thermodynamics", checked: false },
                { id: 'physics-thermal-5-5', name: "Reversible and irreversible processes", checked: false },
                { id: 'physics-thermal-5-6', name: "Carnot engine and its efficiency", checked: false },
              ]
            },
            {
              id: 'physics-thermal-6',
              name: 'Radiation',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-thermal-6-1', name: "Blackbody radiation", checked: false },
                { id: 'physics-thermal-6-2', name: "Absorptive and emissive powers", checked: false },
                { id: 'physics-thermal-6-3', name: "Kirchhoff's law", checked: false },
                { id: 'physics-thermal-6-4', name: "Wien's displacement law", checked: false },
                { id: 'physics-thermal-6-5', name: "Stefan's law", checked: false },
              ]
            },
          ]
        },
        {
          id: 'physics-electricity',
          name: 'Electricity and Magnetism',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'physics-electricity-1',
              name: 'Electrostatics',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-electricity-1-1', name: "Coulomb's law", checked: false },
                { id: 'physics-electricity-1-2', name: "Electric field and potential", checked: false },
                { id: 'physics-electricity-1-3', name: "Electrical potential energy of point charges", checked: false },
                { id: 'physics-electricity-1-4', name: "Electrical potential energy of dipoles", checked: false },
                { id: 'physics-electricity-1-5', name: "Electric field lines", checked: false },
                { id: 'physics-electricity-1-6', name: "Flux of electric field", checked: false },
                { id: 'physics-electricity-1-7', name: "Gauss's law and its applications", checked: false },
              ]
            },
            {
              id: 'physics-electricity-2',
              name: 'Capacitance',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-electricity-2-1', name: "Parallel plate capacitor without dielectrics", checked: false },
                { id: 'physics-electricity-2-2', name: "Parallel plate capacitor with dielectrics", checked: false },
                { id: 'physics-electricity-2-3', name: "Capacitors in series", checked: false },
                { id: 'physics-electricity-2-4', name: "Capacitors in parallel", checked: false },
                { id: 'physics-electricity-2-5', name: "Energy stored in a capacitor", checked: false },
              ]
            },
            {
              id: 'physics-electricity-3',
              name: 'Current electricity',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-electricity-3-1', name: "Ohm's law", checked: false },
                { id: 'physics-electricity-3-2', name: "Series arrangement of resistances", checked: false },
                { id: 'physics-electricity-3-3', name: "Parallel arrangement of resistances", checked: false },
                { id: 'physics-electricity-3-4', name: "Series arrangement of cells", checked: false },
                { id: 'physics-electricity-3-5', name: "Parallel arrangement of cells", checked: false },
                { id: 'physics-electricity-3-6', name: "Kirchhoff's laws", checked: false },
                { id: 'physics-electricity-3-7', name: "Heating effect of current", checked: false },
              ]
            },
            {
              id: 'physics-electricity-4',
              name: 'Magnetism',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-electricity-4-1', name: "Biot-Savart's law", checked: false },
                { id: 'physics-electricity-4-2', name: "Ampere's law", checked: false },
                { id: 'physics-electricity-4-3', name: "Magnetic field near current-carrying straight wire", checked: false },
                { id: 'physics-electricity-4-4', name: "Magnetic field along axis of circular coil", checked: false },
                { id: 'physics-electricity-4-5', name: "Magnetic field inside long straight solenoid", checked: false },
                { id: 'physics-electricity-4-6', name: "Force on moving charge in magnetic field", checked: false },
                { id: 'physics-electricity-4-7', name: "Force on current-carrying wire in magnetic field", checked: false },
              ]
            },
            {
              id: 'physics-electricity-5',
              name: 'Magnetic effects',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-electricity-5-1', name: "Magnetic moment of current loop", checked: false },
                { id: 'physics-electricity-5-2', name: "Effect of magnetic field on current loop", checked: false },
                { id: 'physics-electricity-5-3', name: "Moving coil galvanometer", checked: false },
                { id: 'physics-electricity-5-4', name: "Conversion to voltmeter", checked: false },
                { id: 'physics-electricity-5-5', name: "Conversion to ammeter", checked: false },
              ]
            },
            {
              id: 'physics-electricity-6',
              name: 'Electromagnetic induction',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-electricity-6-1', name: "Faraday's law", checked: false },
                { id: 'physics-electricity-6-2', name: "Lenz's law", checked: false },
                { id: 'physics-electricity-6-3', name: "Self inductance", checked: false },
                { id: 'physics-electricity-6-4', name: "Mutual inductance", checked: false },
              ]
            },
            {
              id: 'physics-electricity-7',
              name: 'AC and DC circuits',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-electricity-7-1', name: "RC circuits with DC source", checked: false },
                { id: 'physics-electricity-7-2', name: "LR circuits with DC source", checked: false },
                { id: 'physics-electricity-7-3', name: "LC circuits with DC source", checked: false },
                { id: 'physics-electricity-7-4', name: "LCR circuits with DC source", checked: false },
                { id: 'physics-electricity-7-5', name: "RC circuits with AC source", checked: false },
                { id: 'physics-electricity-7-6', name: "LR circuits with AC source", checked: false },
                { id: 'physics-electricity-7-7', name: "LC circuits with AC source", checked: false },
                { id: 'physics-electricity-7-8', name: "LCR circuits with AC source", checked: false },
              ]
            },
          ]
        },
        {
          id: 'physics-em-waves',
          name: 'Electromagnetic Waves',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'physics-em-1',
              name: 'Characteristics',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-em-1-1', name: "Properties of electromagnetic waves", checked: false },
              ]
            },
            {
              id: 'physics-em-2',
              name: 'Electromagnetic spectrum',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-em-2-1', name: "Radio waves", checked: false },
                { id: 'physics-em-2-2', name: "Microwaves", checked: false },
                { id: 'physics-em-2-3', name: "Infrared", checked: false },
                { id: 'physics-em-2-4', name: "Visible light", checked: false },
                { id: 'physics-em-2-5', name: "Ultraviolet", checked: false },
                { id: 'physics-em-2-6', name: "X-rays", checked: false },
                { id: 'physics-em-2-7', name: "Gamma rays", checked: false },
                { id: 'physics-em-2-8', name: "Uses of electromagnetic spectrum", checked: false },
              ]
            },
          ]
        },
        {
          id: 'physics-optics',
          name: 'Optics',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'physics-optics-1',
              name: 'Ray optics',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-optics-1-1', name: "Rectilinear propagation of light", checked: false },
                { id: 'physics-optics-1-2', name: "Reflection at plane surfaces", checked: false },
                { id: 'physics-optics-1-3', name: "Reflection at spherical surfaces", checked: false },
                { id: 'physics-optics-1-4', name: "Refraction at plane surfaces", checked: false },
                { id: 'physics-optics-1-5', name: "Refraction at spherical surfaces", checked: false },
                { id: 'physics-optics-1-6', name: "Total internal reflection", checked: false },
                { id: 'physics-optics-1-7', name: "Deviation and dispersion by prism", checked: false },
                { id: 'physics-optics-1-8', name: "Thin lenses", checked: false },
                { id: 'physics-optics-1-9', name: "Combinations of mirrors and thin lenses", checked: false },
                { id: 'physics-optics-1-10', name: "Magnification", checked: false },
              ]
            },
            {
              id: 'physics-optics-2',
              name: 'Wave optics',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-optics-2-1', name: "Huygen's principle", checked: false },
                { id: 'physics-optics-2-2', name: "Interference (Young's double slit experiment)", checked: false },
                { id: 'physics-optics-2-3', name: "Diffraction due to single slit", checked: false },
                { id: 'physics-optics-2-4', name: "Polarization of light", checked: false },
                { id: 'physics-optics-2-5', name: "Plane polarized light", checked: false },
                { id: 'physics-optics-2-6', name: "Brewster's law", checked: false },
                { id: 'physics-optics-2-7', name: "Polaroids", checked: false },
              ]
            },
          ]
        },
        {
          id: 'physics-modern',
          name: 'Modern Physics',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'physics-modern-1',
              name: 'Nuclear physics',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-modern-1-1', name: "Atomic nucleus", checked: false },
                { id: 'physics-modern-1-2', name: "Alpha, beta and gamma radiations", checked: false },
                { id: 'physics-modern-1-3', name: "Law of radioactive decay", checked: false },
                { id: 'physics-modern-1-4', name: "Decay constant", checked: false },
                { id: 'physics-modern-1-5', name: "Half-life and mean life", checked: false },
                { id: 'physics-modern-1-6', name: "Binding energy and its calculation", checked: false },
                { id: 'physics-modern-1-7', name: "Fission processes", checked: false },
                { id: 'physics-modern-1-8', name: "Fusion processes", checked: false },
                { id: 'physics-modern-1-9', name: "Energy calculation in nuclear processes", checked: false },
              ]
            },
            {
              id: 'physics-modern-2',
              name: 'Quantum physics',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'physics-modern-2-1', name: "Photoelectric effect", checked: false },
                { id: 'physics-modern-2-2', name: "Bohr's theory of hydrogen-like atoms", checked: false },
                { id: 'physics-modern-2-3', name: "Characteristic X-rays", checked: false },
                { id: 'physics-modern-2-4', name: "Continuous X-rays", checked: false },
                { id: 'physics-modern-2-5', name: "Moseley's law", checked: false },
                { id: 'physics-modern-2-6', name: "de Broglie wavelength of matter waves", checked: false },
              ]
            },
          ]
        },
      ]
    },
    {
      id: 'mathematics',
      name: 'MATHEMATICS',
      checked: false,
      chapters: [
        {
          id: 'math-sets',
          name: 'Sets, Relations and Functions',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'math-sets-1',
              name: 'Sets and their representations',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-sets-1-1', name: "Different kinds of sets (empty, finite, infinite)", checked: false },
                { id: 'math-sets-1-2', name: "Algebra of sets", checked: false },
                { id: 'math-sets-1-3', name: "Intersection, complement, difference", checked: false },
                { id: 'math-sets-1-4', name: "Symmetric difference and algebraic properties", checked: false },
                { id: 'math-sets-1-5', name: "De-Morgan's laws", checked: false },
                { id: 'math-sets-1-6', name: "Practical problems on sets", checked: false },
              ]
            },
            {
              id: 'math-sets-2',
              name: 'Relations',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-sets-2-1', name: "Cartesian product of finite sets", checked: false },
                { id: 'math-sets-2-2', name: "Ordered pair", checked: false },
                { id: 'math-sets-2-3', name: "Domain and codomain of relations", checked: false },
                { id: 'math-sets-2-4', name: "Equivalence relation", checked: false },
              ]
            },
            {
              id: 'math-sets-3',
              name: 'Functions',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-sets-3-1', name: "Function as a special case of relation", checked: false },
                { id: 'math-sets-3-2', name: "Functions as mappings", checked: false },
                { id: 'math-sets-3-3', name: "Domain, codomain, range of functions", checked: false },
                { id: 'math-sets-3-4', name: "Invertible functions", checked: false },
                { id: 'math-sets-3-5', name: "Even and odd functions", checked: false },
                { id: 'math-sets-3-6', name: "Into, onto and one-to-one functions", checked: false },
                { id: 'math-sets-3-7', name: "Special functions (polynomial, trigonometric, etc.)", checked: false },
                { id: 'math-sets-3-8', name: "Operations on functions", checked: false },
              ]
            },
          ]
        },
        {
          id: 'math-algebra',
          name: 'Algebra',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'math-algebra-1',
              name: 'Complex numbers',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-algebra-1-1', name: "Addition and multiplication", checked: false },
                { id: 'math-algebra-1-2', name: "Conjugation", checked: false },
                { id: 'math-algebra-1-3', name: "Polar representation", checked: false },
                { id: 'math-algebra-1-4', name: "Properties of modulus and principal argument", checked: false },
                { id: 'math-algebra-1-5', name: "Triangle inequality", checked: false },
                { id: 'math-algebra-1-6', name: "Cube roots of unity", checked: false },
                { id: 'math-algebra-1-7', name: "Geometric interpretations", checked: false },
              ]
            },
            {
              id: 'math-algebra-2',
              name: 'Quadratic equations',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-algebra-2-1', name: "Fundamental theorem of algebra", checked: false },
                { id: 'math-algebra-2-2', name: "Relations between roots and coefficients", checked: false },
                { id: 'math-algebra-2-3', name: "Formation of quadratic equations with given roots", checked: false },
                { id: 'math-algebra-2-4', name: "Symmetric functions of roots", checked: false },
              ]
            },
            {
              id: 'math-algebra-3',
              name: 'Progressions',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-algebra-3-1', name: "Arithmetic progressions", checked: false },
                { id: 'math-algebra-3-2', name: "Geometric progressions", checked: false },
                { id: 'math-algebra-3-3', name: "Arithmetic and geometric means", checked: false },
                { id: 'math-algebra-3-4', name: "Sums of finite arithmetic progressions", checked: false },
                { id: 'math-algebra-3-5', name: "Sums of finite geometric progressions", checked: false },
                { id: 'math-algebra-3-6', name: "Infinite geometric series", checked: false },
                { id: 'math-algebra-3-7', name: "Sum of first n natural numbers", checked: false },
                { id: 'math-algebra-3-8', name: "Sum of squares of first n natural numbers", checked: false },
                { id: 'math-algebra-3-9', name: "Sum of cubes of first n natural numbers", checked: false },
              ]
            },
            {
              id: 'math-algebra-4',
              name: 'Other algebraic concepts',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-algebra-4-1', name: "Logarithms and their properties", checked: false },
                { id: 'math-algebra-4-2', name: "Permutations and combinations", checked: false },
                { id: 'math-algebra-4-3', name: "Binomial theorem for positive integral index", checked: false },
                { id: 'math-algebra-4-4', name: "Properties of binomial coefficients", checked: false },
              ]
            },
          ]
        },
        {
          id: 'math-matrices',
          name: 'Matrices',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'math-matrices-1',
              name: 'Basic concepts',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-matrices-1-1', name: "Matrices as rectangular array of real numbers", checked: false },
                { id: 'math-matrices-1-2', name: "Equality of matrices", checked: false },
                { id: 'math-matrices-1-3', name: "Addition of matrices", checked: false },
                { id: 'math-matrices-1-4', name: "Multiplication by scalar", checked: false },
                { id: 'math-matrices-1-5', name: "Matrix multiplication", checked: false },
                { id: 'math-matrices-1-6', name: "Transpose of a matrix", checked: false },
              ]
            },
            {
              id: 'math-matrices-2',
              name: 'Matrix operations',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-matrices-2-1', name: "Elementary row transformations", checked: false },
                { id: 'math-matrices-2-2', name: "Elementary column transformations", checked: false },
                { id: 'math-matrices-2-3', name: "Determinant of square matrix (order up to three)", checked: false },
                { id: 'math-matrices-2-4', name: "Adjoint of a matrix", checked: false },
                { id: 'math-matrices-2-5', name: "Inverse of square matrix (order up to three)", checked: false },
                { id: 'math-matrices-2-6', name: "Properties of matrix operations", checked: false },
              ]
            },
            {
              id: 'math-matrices-3',
              name: 'Special matrices',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-matrices-3-1', name: "Diagonal matrices", checked: false },
                { id: 'math-matrices-3-2', name: "Symmetric matrices", checked: false },
                { id: 'math-matrices-3-3', name: "Skew-symmetric matrices", checked: false },
                { id: 'math-matrices-3-4', name: "Properties of special matrices", checked: false },
              ]
            },
            {
              id: 'math-matrices-4',
              name: 'Applications',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-matrices-4-1', name: "Solutions of simultaneous linear equations (two variables)", checked: false },
                { id: 'math-matrices-4-2', name: "Solutions of simultaneous linear equations (three variables)", checked: false },
              ]
            },
          ]
        },
        {
          id: 'math-probability',
          name: 'Probability and Statistics',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'math-prob-1',
              name: 'Basic probability',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-prob-1-1', name: "Random experiment", checked: false },
                { id: 'math-prob-1-2', name: "Sample space", checked: false },
                { id: 'math-prob-1-3', name: "Impossible events", checked: false },
                { id: 'math-prob-1-4', name: "Simple events", checked: false },
                { id: 'math-prob-1-5', name: "Compound events", checked: false },
              ]
            },
            {
              id: 'math-prob-2',
              name: 'Probability rules',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-prob-2-1', name: "Addition rule", checked: false },
                { id: 'math-prob-2-2', name: "Multiplication rule", checked: false },
                { id: 'math-prob-2-3', name: "Conditional probability", checked: false },
                { id: 'math-prob-2-4', name: "Independence of events", checked: false },
                { id: 'math-prob-2-5', name: "Total probability", checked: false },
                { id: 'math-prob-2-6', name: "Bayes Theorem", checked: false },
              ]
            },
            {
              id: 'math-prob-3',
              name: 'Probability computation',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-prob-3-1', name: "Using permutations", checked: false },
                { id: 'math-prob-3-2', name: "Using combinations", checked: false },
              ]
            },
            {
              id: 'math-prob-4',
              name: 'Statistics',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-prob-4-1', name: "Measure of central tendency", checked: false },
                { id: 'math-prob-4-2', name: "Mean", checked: false },
                { id: 'math-prob-4-3', name: "Median", checked: false },
                { id: 'math-prob-4-4', name: "Mode", checked: false },
                { id: 'math-prob-4-5', name: "Measure of dispersion", checked: false },
                { id: 'math-prob-4-6', name: "Mean deviation", checked: false },
                { id: 'math-prob-4-7', name: "Standard deviation", checked: false },
                { id: 'math-prob-4-8', name: "Variance of grouped and ungrouped data", checked: false },
              ]
            },
            {
              id: 'math-prob-5',
              name: 'Advanced statistics',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-prob-5-1', name: "Frequency distribution analysis", checked: false },
                { id: 'math-prob-5-2', name: "Random variable", checked: false },
                { id: 'math-prob-5-3', name: "Mean of random variable", checked: false },
                { id: 'math-prob-5-4', name: "Variance of random variable", checked: false },
              ]
            },
          ]
        },
        {
          id: 'math-trigonometry',
          name: 'Trigonometry',
          checked: false,
          expanded: false,
          topics: [
            {
              id: 'math-trig-1',
              name: 'Trigonometric functions',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-trig-1-1', name: "Periodicity", checked: false },
                { id: 'math-trig-1-2', name: "Graphs", checked: false },
              ]
            },
            {
              id: 'math-trig-2',
              name: 'Trigonometric formulas',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-trig-2-1', name: "Addition formulas", checked: false },
                { id: 'math-trig-2-2', name: "Subtraction formulas", checked: false },
                { id: 'math-trig-2-3', name: "Multiple angle formulas", checked: false },
                { id: 'math-trig-2-4', name: "Sub-multiple angle formulas", checked: false },
              ]
            },
            {
              id: 'math-trig-3',
              name: 'Trigonometric equations',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-trig-3-1', name: "General solution", checked: false },
              ]
            },
            {
              id: 'math-trig-4',
              name: 'Inverse trigonometric functions',
              checked: false,
              expanded: false,
              subTopics: [
                { id: 'math-trig-4-1', name: "Principal value", checked: false },
                { id: 'math-trig-4-2', name: "Elementary properties", checked: false },
              ]
            },
          ]
        },
      ]
    }
  ]);

  // Load persisted syllabusData
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('syllabusData');
        if (stored) setSyllabusData(JSON.parse(stored));
      } catch (e) {
        console.error('Load syllabusData', e);
      }
    })();
  }, []);

  // Persist syllabusData on each change
  useEffect(() => {
    AsyncStorage.setItem('syllabusData', JSON.stringify(syllabusData));
  }, [syllabusData]);

  // Reset all checks
  const resetAll = useCallback(() => {
    setSyllabusData(prev => prev.map(subj => ({
      ...subj,
      checked: false,
      chapters: subj.chapters.map(ch => ({
        ...ch,
        checked: false,
        expanded: false,
        topics: ch.topics.map(t => ({
          ...t,
          checked: false,
          expanded: false,
          subTopics: t.subTopics.map(st => ({ ...st, checked: false }))
        }))
      }))
    })));
  }, []);

  // Calculate progress percent
  const progress = useMemo(() => {
    let total = 0, checked = 0;
    const subj = syllabusData.find(s => s.id === activeSubject);
    subj?.chapters.forEach(ch => ch.topics.forEach(t => t.subTopics.forEach(st => {
      total++;
      if (st.checked) checked++;
    })));
    return total ? checked / total : 0;
  }, [syllabusData, activeSubject]);

  // Function to toggle expanded state of a chapter
  const toggleChapterExpanded = useCallback((chapterId: string) => {
    setSyllabusData(prevData => {
      return prevData.map(subject => {
        if (subject.id === activeSubject) {
          return {
            ...subject,
            chapters: subject.chapters.map(chapter => {
              if (chapter.id === chapterId) {
                return {
                  ...chapter,
                  expanded: !chapter.expanded
                };
              }
              return chapter;
            })
          };
        }
        return subject;
      });
    });
  }, [activeSubject]);

  // Function to toggle expanded state of a topic
  const toggleTopicExpanded = useCallback((chapterId: string, topicId: string) => {
    setSyllabusData(prevData => {
      return prevData.map(subject => {
        if (subject.id === activeSubject) {
          return {
            ...subject,
            chapters: subject.chapters.map(chapter => {
              if (chapter.id === chapterId) {
                return {
                  ...chapter,
                  topics: chapter.topics.map(topic => {
                    if (topic.id === topicId) {
                      return {
                        ...topic,
                        expanded: !topic.expanded
                      };
                    }
                    return topic;
                  })
                };
              }
              return chapter;
            })
          };
        }
        return subject;
      });
    });
  }, [activeSubject]);

  // Function to toggle check state of a subtopic
  const toggleSubTopic = useCallback((chapterId: string, topicId: string, subTopicId: string) => {
    setSyllabusData(prevData => {
      return prevData.map(subject => {
        if (subject.id === activeSubject) {
          const updatedChapters = subject.chapters.map(chapter => {
            if (chapter.id === chapterId) {
              const updatedTopics = chapter.topics.map(topic => {
                if (topic.id === topicId) {
                  const updatedSubTopics = topic.subTopics.map(subTopic => {
                    if (subTopic.id === subTopicId) {
                      return { ...subTopic, checked: !subTopic.checked };
                    }
                    return subTopic;
                  });
                  
                  // Check if all subtopics are checked
                  const allSubTopicsChecked = updatedSubTopics.every(st => st.checked);
                  
                  return { 
                    ...topic, 
                    subTopics: updatedSubTopics,
                    checked: allSubTopicsChecked
                  };
                }
                return topic;
              });
              
              // Check if all topics are checked
              const allTopicsChecked = updatedTopics.every(t => t.checked);
              
              return {
                ...chapter,
                topics: updatedTopics,
                checked: allTopicsChecked
              };
            }
            return chapter;
          });
          
          // Check if all chapters are checked
          const allChaptersChecked = updatedChapters.every(c => c.checked);
          
          return {
            ...subject,
            chapters: updatedChapters,
            checked: allChaptersChecked
          };
        }
        return subject;
      });
    });
  }, [activeSubject]);

  // Function to toggle check state of a topic (and all its subtopics)
  const toggleTopic = useCallback((chapterId: string, topicId: string) => {
    setSyllabusData(prevData => {
      return prevData.map(subject => {
        if (subject.id === activeSubject) {
          const updatedChapters = subject.chapters.map(chapter => {
            if (chapter.id === chapterId) {
              const updatedTopics = chapter.topics.map(topic => {
                if (topic.id === topicId) {
                  const newCheckedState = !topic.checked;
                  const updatedSubTopics = topic.subTopics.map(subTopic => ({
                    ...subTopic,
                    checked: newCheckedState
                  }));
                  
                  return { 
                    ...topic, 
                    checked: newCheckedState,
                    subTopics: updatedSubTopics 
                  };
                }
                return topic;
              });
              
              // Check if all topics are checked
              const allTopicsChecked = updatedTopics.every(t => t.checked);
              
              return {
                ...chapter,
                topics: updatedTopics,
                checked: allTopicsChecked
              };
            }
            return chapter;
          });
          
          // Check if all chapters are checked
          const allChaptersChecked = updatedChapters.every(c => c.checked);
          
          return {
            ...subject,
            chapters: updatedChapters,
            checked: allChaptersChecked
          };
        }
        return subject;
      });
    });
  }, [activeSubject]);

  // Function to toggle check state of a chapter (and all its topics and subtopics)
  const toggleChapter = useCallback((chapterId: string) => {
    setSyllabusData(prevData => {
      return prevData.map(subject => {
        if (subject.id === activeSubject) {
          const chapterToToggle = subject.chapters.find(c => c.id === chapterId);
          const newCheckedState = chapterToToggle ? !chapterToToggle.checked : false;
          
          const updatedChapters = subject.chapters.map(chapter => {
            if (chapter.id === chapterId) {
              const updatedTopics = chapter.topics.map(topic => ({
                ...topic,
                checked: newCheckedState,
                subTopics: topic.subTopics.map(subTopic => ({
                  ...subTopic,
                  checked: newCheckedState
                }))
              }));
              
              return {
                ...chapter,
                checked: newCheckedState,
                topics: updatedTopics
              };
            }
            return chapter;
          });
          
          // Check if all chapters are checked
          const allChaptersChecked = updatedChapters.every(c => c.checked);
          
          return {
            ...subject,
            chapters: updatedChapters,
            checked: allChaptersChecked
          };
        }
        return subject;
      });
    });
  }, [activeSubject]);

  // Function to get all checked topics
  const getCheckedTopics = useCallback(() => {
    let result = '';
    
    syllabusData.forEach(subject => {
      let hasCheckedTopics = false;
      let subjectText = `${subject.name}\n\n`;
      
      subject.chapters.forEach(chapter => {
        let chapterHasCheckedTopics = false;
        let chapterText = `${chapter.name}\n`;
        
        chapter.topics.forEach(topic => {
          const checkedSubTopics = topic.subTopics.filter(st => st.checked);
          
          if (checkedSubTopics.length > 0) {
            chapterHasCheckedTopics = true;
            chapterText += `- ${topic.name}\n`;
            
            checkedSubTopics.forEach(st => {
              chapterText += `  • ${st.name}\n`;
            });
          }
        });
        
        if (chapterHasCheckedTopics) {
          hasCheckedTopics = true;
          subjectText += chapterText + '\n';
        }
      });
      
      if (hasCheckedTopics) {
        result += subjectText + '\n';
      }
    });
    
    return result || 'No topics mastered yet.';
  }, [syllabusData]);

  // Function to copy checked topics to clipboard
  const copyCheckedTopics = useCallback(() => {
    const text = getCheckedTopics();
    Clipboard.setString(text);
    toast.success('Copied to clipboard!');
  }, [getCheckedTopics]);

  // Function to collect checked topics into an object
  const collectCheckedTopicsObj = useCallback(() => {
    const obj: Record<string,string[]> = {};
    syllabusData.forEach(subject => {
      const list:string[]=[];
      subject.chapters.forEach(ch => {
        ch.topics.forEach(tp => {
          tp.subTopics.filter(st => st.checked).forEach(st => list.push(st.name));
        });
      });
      if(list.length) obj[subject.id]=list;
    });
    return obj;
  }, [syllabusData]);

  // Function to build prompt for mock test generation
  const buildPrompt = useCallback((totalQ: number, topicsObj: Record<string,string[]>) => {
    const subjects = Object.keys(topicsObj).map(s => s.charAt(0).toUpperCase() + s.slice(1));
    
    let prompt = `Please create a COMPLETE JEE (Mains + Advanced) mock test.\n` +
      `Constraints:\n` +
      `* Total Questions: ${totalQ} (EXACT)\n` +
      `* Subjects: ${subjects.join(', ')}\n` +
      `* Distribute questions as evenly as possible across the subjects listed above.\n` +
      `* Use ONLY single-correct MCQs (four options) – no multi-correct.\n` +
      `* Difficulty: Mixed JEE Advanced & challenging JEE Mains.\n` +
      `* Time Limit suggestion for students: 3 hours (don't include in output).\n\n` +
      `Syllabus TO COVER (organise topic field exactly as given):`;
    
    subjects.forEach(sub => {
      prompt += `\n* ${sub}:`;
      topicsObj[sub.toLowerCase()].forEach(t => {
        prompt += `\n  * ${t}`;
      });
    });
    
    prompt += `\n\nOUTPUT (STRICT):\n` +
      `1️⃣ First JSON code block → Array of questions. Each question object:\n` +
      `   {"questionNumber":1,"question":"…","optionA":"…","optionB":"…","optionC":"…","optionD":"…","subject":"…","topic":"…"}\n` +
      `2️⃣ Second JSON code block → Answer key object e.g. {"1":"C"}.\n` +
      `3️⃣ Third JSON code block → Array of detailed solutions. Each solution object:\n` +
      `   {"questionNumber":1,"detailedSolution":"step1\nstep2","correctOption":"C","finalAnswer":"…"}`;
    
    return prompt;
  }, []);

  // Function to generate mock test
  const generateMockTest = useCallback(async () => {
    const topicsObj = collectCheckedTopicsObj();
    if(Object.keys(topicsObj).length===0){toast.error('Select some topics first');return;};
    const totalQ = parseInt(totalQuestions) || 10;
    setIsGenerating(true);
    try {
      const prompt = buildPrompt(totalQ, topicsObj);
      const res = await fetch(process.env.EXPO_PUBLIC_API_URL + '/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const res = await fetch('https://agent-prod.studio.lyzr.ai/v3/inference/chat/',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':'sk-default-pFNnvq5oSDeZx345ky9zBJpfhLruHKsO'},body});
      const data = await res.json();
      const text = data.message || data.agent_response || data.response || JSON.stringify(data);
      const codeBlocks = text.match(/```json[\s\S]*?```/g) || [];
      const parseBlock = (block:string)=>{try{return JSON.parse(block.replace(/```json|```/g,''));}catch{return null}};
      const questions = parseBlock(codeBlocks[0]||'');
      const answerKey = parseBlock(codeBlocks[1]||'');
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        if (e.message.includes('network')) {
          toast.error('Network error. Please check your connection.');
        } else if (e.message.includes('parse')) {
          toast.error('Failed to parse response. Please try again.');
        } else {
          toast.error(`Generation failed: ${e.message}`);
        }
      } else {
        toast.error('An unexpected error occurred');
      }
      setIsGenerating(false);
    }
      navigation.navigate('CBTExam' as never, {questions, answerKey, solutions} as never);
    } catch (e) {
      console.error(e);
      toast.error('Generation failed');
      setIsGenerating(false);
    }
  }, [collectCheckedTopicsObj, totalQuestions, buildPrompt, navigation]);

  // Filter subjects based on search query
  const filteredSubjects = useMemo(() => {
    if (!searchQuery) return syllabusData;
    
    const query = searchQuery.toLowerCase();
    
    return syllabusData.map(subject => {
      // Filter chapters
      const filteredChapters = subject.chapters.map(chapter => {
        // Filter topics
        const filteredTopics = chapter.topics.map(topic => {
          // Filter subtopics
          const filteredSubTopics = topic.subTopics.filter(subTopic => 
            subTopic.name.toLowerCase().includes(query)
          );
          
          return {
            ...topic,
            subTopics: filteredSubTopics,
            matchesSearch: topic.name.toLowerCase().includes(query) || filteredSubTopics.length > 0
          };
        }).filter(topic => topic.matchesSearch || topic.name.toLowerCase().includes(query));
        
        return {
          ...chapter,
          topics: filteredTopics,
          matchesSearch: chapter.name.toLowerCase().includes(query) || filteredTopics.length > 0
        };
      }).filter(chapter => chapter.matchesSearch || chapter.name.toLowerCase().includes(query));
      
      return {
        ...subject,
        chapters: filteredChapters,
        matchesSearch: subject.name.toLowerCase().includes(query) || filteredChapters.length > 0
      };
    }).filter(subject => subject.matchesSearch || subject.name.toLowerCase().includes(query));
  }, [syllabusData, searchQuery]);

  // Get active subject data
  const activeSubjectData = useMemo(() => {
    return syllabusData.find(subject => subject.id === activeSubject) || syllabusData[0];
  }, [syllabusData, activeSubject]);

  // Get subjects for tabs
  const subjects = useMemo<SubjectTab[]>(() => {
    return syllabusData.map(subject => ({
      id: subject.id,
      name: subject.name
    }));
  }, [syllabusData]);

  // Get chapters for active subject
  const chapters = useMemo(() => {
    return searchQuery ? filteredSubjects.flatMap(subject => subject.chapters) : activeSubjectData?.chapters || [];
  }, [searchQuery, filteredSubjects, activeSubjectData]);

  return (
    <SafeAreaView style={styles.container}>
      <DashboardBackground>
        {/* Header */}
        <DashboardHeader 
          title="JEE Advanced 2025" 
          subtitle="Mastery Tracker" 
        />
        
        {/* Progress Bar & Reset */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{`${Math.round(progress * 100)}% Completed`}</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
          <TouchableOpacity onPress={resetAll} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Uncheck All</Text>
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <SearchBar 
          value={searchQuery} 
          onChangeText={setSearchQuery} 
          placeholder="Search topics..." 
        />
        
        {/* Subject Tabs */}
        <SubjectTabs 
          subjects={subjects} 
          activeSubject={activeSubject} 
          onSelectSubject={setActiveSubject} 
        />
        
        {/* Content */}
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <ChapterList 
            chapters={chapters}
            subjectId={activeSubject}
            onToggleChapter={toggleChapter}
            onToggleChapterExpanded={toggleChapterExpanded}
            onToggleTopic={toggleTopic}
            onToggleTopicExpanded={toggleTopicExpanded}
            onToggleSubTopic={toggleSubTopic}
          />
        </ScrollView>
        
        {/* Footer */}
        <DashboardFooter onViewCheckedTopics={() => setShowCheckedTopics(true)} />
        
        {/* Checked Topics Modal */}
        <CheckedTopicsModal
          visible={showCheckedTopics}
          onClose={() => setShowCheckedTopics(false)}
          onGenerateTest={() => setShowGenerateModal(true)}
          onCopyToClipboard={copyCheckedTopics}
          checkedTopicsText={getCheckedTopics()}
        />

        {/* Generate Test Modal */}
        <GenerateTestModal
          visible={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          onGenerate={generateMockTest}
          totalQuestions={totalQuestions}
          onChangeTotalQuestions={setTotalQuestions}
          isGenerating={isGenerating}
        />
      </DashboardBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginBottom: 4,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  resetButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});