import { Skeleton, keyframes, styled as muiStyled } from "@mui/material";
import { Link as LinkComponent } from "react-router-dom";
import { grayColor, matBlack } from "../../constants/color";
import styled from "styled-components";

const VisuallyHiddenInput = muiStyled("input")({
  border: 0,
  clip: "rect(0 0 0 0)",
  height: 1,
  margin: -1,
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
});

const Link = muiStyled(LinkComponent)`
  text-decoration: none;
  color: black;
  padding: 1rem;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const InputBox = muiStyled("input")`
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  padding: 0 3rem;
  border-radius: 1.5rem;
  background-color: ${grayColor};
`;

const SearchField = muiStyled("input")`
  padding: 1rem 2rem;
  width: 20vmax;
  border: none;
  outline: none;
  border-radius: 1.5rem;
  background-color: ${grayColor};
  font-size: 1.1rem;
`;

const CurveButton = muiStyled("button")`
  border-radius: 1.5rem;
  padding: 1rem 2rem;
  border: none;
  outline: none;
  cursor: pointer;
  background-color: ${matBlack};
  color: white;
  font-size: 1.1rem;
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

const bounceAnimation = keyframes`
0% { transform: scale(1); }
50% { transform: scale(1.5); }
100% { transform: scale(1); }
`;

const BouncingSkeleton = muiStyled(Skeleton)(() => ({
  animation: `${bounceAnimation} 1s infinite`,
}));

export const SmartRepliesContainer = styled.div`
  margin: 10px 0;

  .reply-buttons {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .reply-buttons button {
    padding: 8px 12px;
    border: none;
    background-color: #007bff;
    color: white;
    border-radius: 4px;
    cursor: pointer;
  }

  .reply-buttons button:hover {
    background-color: #0056b3;
  }
`;

export {
  CurveButton,
  SearchField,
  InputBox,
  Link,
  VisuallyHiddenInput,
  BouncingSkeleton,
};

// Original Source:

// import { Skeleton, keyframes, styled } from "@mui/material";
// import { Link as LinkComponent } from "react-router-dom";
// import { grayColor, matBlack } from "../../constants/color";

// const VisuallyHiddenInput = styled("input")({
//   border: 0,
//   clip: "rect(0 0 0 0)",
//   height: 1,
//   margin: -1,
//   overflow: "hidden",
//   padding: 0,
//   position: "absolute",
//   whiteSpace: "nowrap",
//   width: 1,
// });

// const Link = styled(LinkComponent)`
//   text-decoration: none;
//   color: black;
//   padding: 1rem;
//   &:hover {
//     background-color: rgba(0, 0, 0, 0.1);
//   }
// `;

// const InputBox = styled("input")`
//   width: 100%;
//   height: 100%;
//   border: none;
//   outline: none;
//   padding: 0 3rem;
//   border-radius: 1.5rem;
//   background-color: ${grayColor};
// `;

// const SearchField = styled("input")`
//   padding: 1rem 2rem;
//   width: 20vmax;
//   border: none;
//   outline: none;
//   border-radius: 1.5rem;
//   background-color: ${grayColor};
//   font-size: 1.1rem;
// `;

// const CurveButton = styled("button")`
//   border-radius: 1.5rem;
//   padding: 1rem 2rem;
//   border: none;
//   outline: none;
//   cursor: pointer;
//   background-color: ${matBlack};
//   color: white;
//   font-size: 1.1rem;
//   &:hover {
//     background-color: rgba(0, 0, 0, 0.8);
//   }
// `;

// const bounceAnimation = keyframes`
// 0% { transform: scale(1); }
// 50% { transform: scale(1.5); }
// 100% { transform: scale(1); }
// `;

// const BouncingSkeleton = styled(Skeleton)(() => ({
//   animation: `${bounceAnimation} 1s infinite`,
// }));


// export {
//   CurveButton,
//   SearchField,
//   InputBox,
//   Link,
//   VisuallyHiddenInput,
//   BouncingSkeleton,
// };
