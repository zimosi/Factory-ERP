# 🏭 Factory ERP System

A comprehensive Enterprise Resource Planning system designed for manufacturing and factory management, built with modern web technologies.

## ✨ Features

### 🏗️ **Production Management**
- **Production Orders**: Create and manage production orders with boat serial numbers
- **Material Requirements**: Track material usage and requirements for production
- **Pick Orders**: Generate and manage material pick orders for production
- **Processing Parts**: Design and manage custom processing parts

### 📦 **Inventory Management**
- **Material Management**: Complete CRUD operations for materials with warehouse support
- **Stock Tracking**: Real-time inventory levels with minimum quantity alerts
- **Inventory Records**: Comprehensive audit trail of all stock movements
- **Warehouse Management**: Multi-warehouse support with location tracking

### 🔧 **After-Sales Service**
- **Repair Orders**: Create and manage repair work orders
- **Material Usage**: Track materials used in repairs with cost calculation
- **Quote Generation**: Automatic pricing calculation with markup rates
- **Pick Order Integration**: Seamless integration with material pick orders

### 💰 **Sales & Procurement**
- **Material Sales**: Direct material sales with automatic stock updates
- **Purchase Orders**: Procurement management with approval workflows
- **Return Management**: Comprehensive return order processing
- **Cost Analysis**: Detailed cost tracking and profit margin calculations

### 🎨 **Design & Engineering**
- **Design Drawings**: Create detailed design drawings with material specifications
- **Processing Design**: Design custom processing parts with cost analysis
- **Version Control**: Track design iterations and changes
- **Material Planning**: Optimize material usage for designs

### 👥 **User Management**
- **Authentication**: Secure login system with role-based access
- **User Roles**: Different permission levels for various operations
- **Audit Trail**: Track all user actions and system changes

## 🛠️ Technology Stack

### **Frontend**
- **React.js** - Modern UI framework with hooks
- **React Router** - Client-side routing and navigation
- **CSS-in-JS** - Component-based styling
- **Local Storage** - Client-side data persistence

### **Backend**
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database management
- **JWT** - JSON Web Token authentication

### **Database Design**
- **Normalized Schema** - Efficient data structure design
- **Foreign Key Constraints** - Data integrity and relationships
- **Indexing** - Optimized query performance
- **Transactions** - ACID compliance for critical operations

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/factory-erp.git
   cd factory-erp
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE factory_erp;"
   
   # Import schema (if available)
   mysql -u root -p factory_erp < database_schema.sql
   ```

4. **Configuration**
   ```bash
   # Update database configuration
   cd server/config
   # Edit db.config.js with your database credentials
   ```

5. **Start the application**
   ```bash
   # Start backend server (from server directory)
   cd server
   npm start
   
   # Start frontend (from root directory)
   npm start
   ```

## 📊 Database Schema

### **Core Tables**
- `materials` - Material inventory and specifications
- `production_orders` - Production order management
- `material_pick_orders` - Material requisition tracking
- `after_sales_orders` - Repair and service orders
- `design_drawings` - Engineering design documentation
- `inventory_records` - Stock movement audit trail

### **Key Relationships**
- Materials ↔ Production Orders (many-to-many)
- Production Orders ↔ Pick Orders (one-to-many)
- Design Drawings ↔ Materials (many-to-many)
- Users ↔ All Operations (audit trail)

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Input Validation** - Server-side data validation
- **SQL Injection Protection** - Parameterized queries
- **Role-based Access Control** - User permission management

## 📱 User Interface

### **Modern Design**
- **Responsive Layout** - Works on all device sizes
- **Intuitive Navigation** - Easy-to-use menu system
- **Real-time Updates** - Live data synchronization
- **Interactive Forms** - Smart autocomplete and validation

### **Key Pages**
- **Dashboard** - Overview of system status
- **Production Management** - Order and material tracking
- **Inventory Control** - Stock management and monitoring
- **Sales & Procurement** - Order processing workflows
- **Design Center** - Engineering and design tools

## 🔄 Workflow Examples

### **Production Order Process**
1. Create production order with boat specifications
2. System calculates material requirements
3. Generate material pick orders
4. Track material consumption
5. Update inventory levels automatically

### **Design Drawing Process**
1. Create new design drawing
2. Specify required materials and quantities
3. Calculate material costs
4. Generate production specifications
5. Link to production orders

## 🧪 Testing

### **Frontend Testing**
```bash
npm test
```

### **Backend Testing**
```bash
cd server
npm test
```

### **Database Testing**
```bash
cd server
node test-db.js
```

## 📈 Performance Features

- **Database Indexing** - Optimized query performance
- **Connection Pooling** - Efficient database connections
- **Debounced Search** - Reduced API calls for better UX
- **Lazy Loading** - On-demand component loading

## 🚧 Development Status

### **Completed Features**
- ✅ User authentication system
- ✅ Material management
- ✅ Production order processing
- ✅ Inventory tracking
- ✅ After-sales service management
- ✅ Design drawing system
- ✅ Material sales and procurement

### **In Progress**
- 🔄 Advanced reporting system
- 🔄 Mobile app development
- 🔄 API documentation

### **Planned Features**
- 📋 Advanced analytics dashboard
- 📋 Integration with external systems
- 📋 Multi-language support
- 📋 Advanced workflow automation

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

### **Documentation**
- [API Documentation](docs/api.md)
- [User Manual](docs/user-manual.md)
- [Developer Guide](docs/developer-guide.md)

### **Contact**
- **Issues**: [GitHub Issues](https://github.com/yourusername/factory-erp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/factory-erp/discussions)
- **Email**: your.email@example.com

## 🙏 Acknowledgments

- **React Team** - For the amazing frontend framework
- **Express.js Community** - For the robust backend framework
- **MySQL Team** - For the reliable database system
- **Open Source Contributors** - For various libraries and tools

## 📊 Project Statistics

- **Lines of Code**: 10,000+
- **Components**: 50+
- **API Endpoints**: 30+
- **Database Tables**: 20+
- **Test Coverage**: 80%+

---

**Made with ❤️ for modern manufacturing**

*Last updated: August 2024*
