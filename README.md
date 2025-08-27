# Symbiotek: AI Plant Companion App

Symbiotek is a modern web application that connects real plant sensor data with an AI companion experience, helping users better understand and care for their plants.

## 🌱 Features

- **Real-time Plant Monitoring**
  - Water level tracking
  - Light level monitoring
  - Dynamic threshold alerts
  - Plant-specific care requirements

- **Smart Dashboard**
  - Visual status indicators
  - Historical data charts
  - Plant health overview
  - Customizable plant profiles

- **User Authentication**
  - Secure email/magic link login
  - Personal plant collection
  - User-specific settings

- **Supabase Integration**
  - Real-time data updates
  - Secure data storage
  - Row-level security
  - Plant type management

## 🚀 Tech Stack

- **Frontend**
  - Next.js 14
  - React
  - TypeScript
  - Tailwind CSS

- **Backend**
  - Supabase
  - PostgreSQL
  - Row Level Security
  - Real-time subscriptions

- **Authentication**
  - Supabase Auth
  - Magic link login

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/NeptuneBeachGreenhouse/Symbiotek.git
   cd Symbiotek
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

1. Run the initial setup scripts in Supabase SQL Editor:
   - `scripts/setup-basic-tables.sql`
   - `scripts/fix-sensor-readings.sql`
   - `scripts/fix-rls-policies.sql`

2. Verify the setup:
   - `scripts/verify-db-setup.sql`
   - `scripts/inspect-tables.sql`

## 📊 Data Structure

- **Plant Types**: Different plant species and their care requirements
- **User Plants**: User's personal plant collection
- **Sensor Readings**: Real-time and historical sensor data
- **Sensor Thresholds**: Plant-specific optimal ranges for various metrics

## 🔐 Security

- Row Level Security (RLS) policies ensure users can only access their own data
- Secure authentication flow using Supabase
- Environment variables for sensitive configuration
- Type-safe database queries

## 🧪 Development

- **Running Tests**
  ```bash
  npm run test
  ```

- **Linting**
  ```bash
  npm run lint
  ```

- **Building for Production**
  ```bash
  npm run build
  ```

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Plant care data and thresholds based on botanical research
- UI/UX inspired by modern design principles
- Built with Supabase's excellent backend-as-a-service

## 🔄 Status

Project is: _in active development_

## 📫 Contact

Created by NeptuneBeachGreenhouse - feel free to contact us!