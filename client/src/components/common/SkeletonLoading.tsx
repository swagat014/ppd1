import React from 'react';
import {
  Box,
  Skeleton,
  Card,
  CardContent,
  Grid,
  Paper,
} from '@mui/material';

interface SkeletonCardProps {
  height?: number;
  width?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | false;
  sx?: any;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  height = 120,
  width = '100%',
  variant = 'rectangular',
  animation = 'wave',
  sx = {},
}) => (
  <Skeleton
    variant={variant}
    width={width}
    height={height}
    animation={animation}
    sx={{
      bgcolor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 3,
      ...sx,
    }}
  />
);

interface SkeletonStatCardProps {
  count?: number;
}

export const SkeletonStatCards: React.FC<SkeletonStatCardProps> = ({ count = 4 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid item xs={12} sm={6} md={3} key={index}>
        <Card
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box width="60%">
                <Skeleton
                  variant="text"
                  width="60%"
                  height={20}
                  animation="wave"
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="40%"
                  height={40}
                  animation="wave"
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}
                />
              </Box>
              <Skeleton
                variant="circular"
                width={50}
                height={50}
                animation="wave"
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

interface SkeletonChartProps {
  height?: number;
}

export const SkeletonChart: React.FC<SkeletonChartProps> = ({ height = 350 }) => (
  <Card
    sx={{
      bgcolor: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: 3,
      height: height + 100,
    }}
  >
    <CardContent>
      <Skeleton
        variant="text"
        width="40%"
        height={30}
        animation="wave"
        sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', mb: 2 }}
      />
      <Skeleton
        variant="rectangular"
        width="100%"
        height={height}
        animation="wave"
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 2,
        }}
      />
    </CardContent>
  </Card>
);

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, columns = 4 }) => (
  <Paper
    sx={{
      bgcolor: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: 3,
      overflow: 'hidden',
    }}
  >
    {/* Header */}
    <Box
      sx={{
        display: 'flex',
        p: 2,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        bgcolor: 'rgba(255, 255, 255, 0.02)',
      }}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton
          key={`header-${index}`}
          variant="text"
          width={`${90 / columns}%`}
          height={24}
          animation="wave"
          sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', mr: 2 }}
        />
      ))}
    </Box>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <Box
        key={`row-${rowIndex}`}
        sx={{
          display: 'flex',
          p: 2,
          borderBottom:
            rowIndex < rows - 1 ? '1px solid rgba(255, 255, 255, 0.03)' : 'none',
        }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={`cell-${rowIndex}-${colIndex}`}
            variant="text"
            width={`${80 / columns}%`}
            height={20}
            animation="wave"
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', mr: 2 }}
          />
        ))}
      </Box>
    ))}
  </Paper>
);

interface SkeletonListProps {
  items?: number;
  avatar?: boolean;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ items = 5, avatar = true }) => (
  <Box>
    {Array.from({ length: items }).map((_, index) => (
      <Box
        key={index}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderBottom:
            index < items - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
        }}
      >
        {avatar && (
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            animation="wave"
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', mr: 2 }}
          />
        )}
        <Box flex={1}>
          <Skeleton
            variant="text"
            width="60%"
            height={20}
            animation="wave"
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}
          />
          <Skeleton
            variant="text"
            width="40%"
            height={16}
            animation="wave"
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}
          />
        </Box>
        <Skeleton
          variant="rectangular"
          width={80}
          height={32}
          animation="wave"
          sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}
        />
      </Box>
    ))}
  </Box>
);

interface SkeletonPageProps {
  statCards?: number;
  charts?: number;
  tables?: number;
}

export const SkeletonPage: React.FC<SkeletonPageProps> = ({
  statCards = 4,
  charts = 2,
  tables = 0,
}) => (
  <Box sx={{ p: 3 }}>
    {/* Header Skeleton */}
    <Skeleton
      variant="text"
      width="40%"
      height={50}
      animation="wave"
      sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', mb: 1 }}
    />
    <Skeleton
      variant="text"
      width="30%"
      height={24}
      animation="wave"
      sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', mb: 4 }}
    />

    {/* Stat Cards */}
    <Box mb={4}>
      <SkeletonStatCards count={statCards} />
    </Box>

    {/* Charts */}
    {charts > 0 && (
      <Grid container spacing={3} mb={4}>
        {Array.from({ length: charts }).map((_, index) => (
          <Grid item xs={12} md={charts === 1 ? 12 : 6} key={index}>
            <SkeletonChart />
          </Grid>
        ))}
      </Grid>
    )}

    {/* Tables */}
    {tables > 0 && (
      <Box mt={4}>
        <Skeleton
          variant="text"
          width="30%"
          height={30}
          animation="wave"
          sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', mb: 2 }}
        />
        <SkeletonTable rows={5} columns={4} />
      </Box>
    )}
  </Box>
);

interface SkeletonDashboardProps {
  type?: 'teacher' | 'tpo' | 'admin' | 'student';
}

export const SkeletonDashboard: React.FC<SkeletonDashboardProps> = ({ type = 'teacher' }) => {
  const configs = {
    teacher: { statCards: 4, charts: 3, tables: 1 },
    tpo: { statCards: 4, charts: 2, tables: 1 },
    admin: { statCards: 8, charts: 3, tables: 1 },
    student: { statCards: 4, charts: 2, tables: 0 },
  };

  const config = configs[type];

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      {/* Header */}
      <Box mb={4}>
        <Skeleton
          variant="text"
          width="50%"
          height={50}
          animation="wave"
          sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', mb: 1 }}
        />
        <Skeleton
          variant="text"
          width="35%"
          height={24}
          animation="wave"
          sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}
        />
      </Box>

      {/* Stats Row */}
      <SkeletonStatCards count={config.statCards} />

      {/* Content Grid */}
      <Grid container spacing={3} mt={2}>
        {Array.from({ length: config.charts }).map((_, index) => (
          <Grid item xs={12} md={config.charts > 2 ? 4 : 6} key={index}>
            <SkeletonChart height={300} />
          </Grid>
        ))}
      </Grid>

      {/* Table Section */}
      {config.tables > 0 && (
        <Box mt={4}>
          <Card
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Skeleton
                variant="text"
                width="30%"
                height={30}
                animation="wave"
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', mb: 3 }}
              />
              <SkeletonList items={5} avatar />
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default SkeletonDashboard;
