import React, { useState } from 'react';
import { Car } from 'lucide-react';
import { ParkingSpace } from './types/parking';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import Navigation from './components/Navigation';
import SearchSpaces from './components/car-owner/SearchSpaces';
import MyCars from './components/car-owner/MyCars';
import MySpaces from './components/space-owner/MySpaces';
import AddSpace from './components/space-owner/AddSpace';
import BookingModal, { BookingData } from './components/BookingModal';
import BookingHistory from './components/BookingHistory';
import { mockBookings } from './data/mockData';

function App() {
  const { user, loading } = useAuth();
  const [activeModule, setActiveModule] = useState<'car_owner' | 'space_owner'>('car_owner');
  const [activeTab, setActiveTab] = useState('search');
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookings, setBookings] = useState(mockBookings);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading ParkSpace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleModuleChange = (module: 'car_owner' | 'space_owner') => {
    setActiveModule(module);
    setActiveTab(module === 'car_owner' ? 'search' : 'my-spaces');
  };

  const handleBookSpace = (space: ParkingSpace) => {
    setSelectedSpace(space);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (bookingData: BookingData) => {
    const newBooking = {
      id: Date.now().toString(),
      space_id: bookingData.spaceId,
      vehicle_id: bookingData.carId,
      car_owner_id: user.id,
      space_owner_id: selectedSpace?.owner_id || '',
      start_time: bookingData.startDate.toISOString(),
      end_time: bookingData.endDate.toISOString(),
      total_cost: bookingData.totalCost,
      booking_type: bookingData.pricingType as any,
      status: 'pending' as const,
      payment_status: 'pending' as const,
      payment_method: 'upi' as const,
      special_instructions: bookingData.specialInstructions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setBookings([newBooking, ...bookings]);
    setShowBookingModal(false);
    setSelectedSpace(null);
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setSelectedSpace(null);
  };

  const renderContent = () => {
    if (activeModule === 'car_owner') {
      switch (activeTab) {
        case 'search':
          return <SearchSpaces onBookSpace={handleBookSpace} />;
        case 'my-cars':
          return <MyCars />;
        case 'my-bookings':
          return <BookingHistory bookings={bookings.filter(b => b.car_owner_id === user.id)} />;
        default:
          return <SearchSpaces onBookSpace={handleBookSpace} />;
      }
    } else {
      switch (activeTab) {
        case 'my-spaces':
          return <MySpaces />;
        case 'add-space':
          return <AddSpace />;
        case 'bookings':
          return <BookingHistory bookings={bookings.filter(b => b.space_owner_id === user.id)} />;
        default:
          return <MySpaces />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <Car className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">ParkSpace India</h1>
          </div>
          <p className="text-center text-gray-600 mt-2">
            India's Smart Parking Solution - Find & List Parking Spaces
          </p>
        </div>
      </div>

      {/* Navigation */}
      <Navigation
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>

      {/* Booking Modal */}
      <BookingModal
        space={selectedSpace}
        onClose={handleCloseModal}
        onBook={handleBookingSubmit}
      />
    </div>
  );
}

export default App;