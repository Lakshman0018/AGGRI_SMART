import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';

const AddressBar = () => {
  const { shippingAddress } = useCart();
  const location = useLocation();

  const hasAddress = Boolean(
    (shippingAddress?.fullName || '').trim() &&
    (shippingAddress?.address || '').trim() &&
    (shippingAddress?.city || '').trim() &&
    (shippingAddress?.pincode || '').trim()
  );

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '64px',
        left: 0,
        right: 0,
        zIndex: 40,
        bgcolor: 'primary.main',
        color: 'white',
        py: 1.5,
        background: 'linear-gradient(90deg, #16a34a 0%, #10b981 100%)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LocationOnIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 }}>
                Deliver to
              </Typography>
              {hasAddress ? (
                <Typography variant="body2" fontWeight="semibold" sx={{ mt: 0.5 }}>
                  {shippingAddress.fullName} • {shippingAddress.address}, {shippingAddress.city} {shippingAddress.pincode}
                </Typography>
              ) : (
                <Typography variant="body2" fontWeight="semibold" sx={{ mt: 0.5 }}>
                  No address set
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {hasAddress && (
              <Chip
                label={shippingAddress.phone || 'Add phone'}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: { xs: 'none', md: 'flex' }
                }}
              />
            )}
            {location.pathname === '/payment' ? (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<EditIcon />}
                disabled
                sx={{ whiteSpace: 'nowrap' }}
              >
                Editing Address
              </Button>
            ) : (
              <Button
                component={Link}
                to="/payment"
                variant={hasAddress ? 'outlined' : 'contained'}
                color="secondary"
                startIcon={<EditIcon />}
                sx={{
                  whiteSpace: 'nowrap',
                  borderColor: hasAddress ? 'rgba(255,255,255,0.3)' : 'transparent',
                  '&:hover': {
                    borderColor: hasAddress ? 'rgba(255,255,255,0.5)' : 'transparent',
                  }
                }}
              >
                {hasAddress ? 'Change' : 'Add Address'}
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AddressBar;
